export const shareContent = async (urlPath: string, displayType: string) => {
  const fullUrl = `${window.location.origin}${urlPath}`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Check out this ${displayType} on NEXA`,
        url: fullUrl,
      });
      return { success: true, method: 'native' };
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error("Native share failed:", e);
      } else {
        return { success: false, method: 'native', aborted: true };
      }
    }
  }
  
  try {
    await navigator.clipboard.writeText(fullUrl);
    alert("Link copied");
    return { success: true, method: 'clipboard' };
  } catch (e) {
    console.error("Clipboard write failed:", e);
    alert("Failed to copy link");
    return { success: false, method: 'clipboard' };
  }
};
