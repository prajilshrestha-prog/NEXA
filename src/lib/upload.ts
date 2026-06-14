import { supabase } from "./supabase";

const MAX_RETRIES = 3;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Max dimensions
        const MAX_DIMENSION = 1920;
        if (width > height && width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            "image/jpeg",
            0.8,
          ); // 80% quality
        } else {
          resolve(file);
        }
      };
      if (typeof e.target?.result === "string") {
        img.src = e.target.result;
      } else {
        resolve(file);
      }
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export async function uploadMedia(
  file: File,
  bucket: string = "media",
  onProgress?: (progress: number) => void,
): Promise<string> {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image exceeds maximum size of 10MB");
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error("Video exceeds maximum size of 50MB");
  }

  let attempt = 0;

  const optimizedFile = await compressImage(file);

  while (attempt < MAX_RETRIES) {
    try {
      const fileExt = optimizedFile.name.split(".").pop() || "jpg";
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Simulate progress for generic uploads since standard Supabase upload doesn't support progress events
      let progressInterval: any;
      if (onProgress) {
        let p = 0;
        progressInterval = setInterval(() => {
          p += 10;
          if (p > 90) p = 90;
          onProgress(p);
        }, 200);
      }

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, optimizedFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: optimizedFile.type,
        });

      if (progressInterval) clearInterval(progressInterval);

      if (error) throw error;

      if (onProgress) onProgress(100);

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      attempt++;
      console.error(`Upload Error (Attempt ${attempt}/${MAX_RETRIES}):`, error);
      
      // Fallback to data URL if we hit network/CORS/'Failed to fetch' errors 
      // which typically happen in sandbox when the bucket doesn't exist.
      if (error?.message === "Failed to fetch" || error?.message?.includes("Failed to fetch") || attempt >= MAX_RETRIES) {
         console.warn("Falling back to Base64 data URL due to storage error.");
         return new Promise((resolve) => {
           const reader = new FileReader();
           reader.onloadend = () => resolve(reader.result as string);
           reader.readAsDataURL(file);
         });
      }

      // Wait before retry
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("Upload failed");
}
