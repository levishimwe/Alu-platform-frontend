// Helper function to convert Google Drive sharing link to direct image URL
export const convertGoogleDriveImageUrl = (shareUrl) => {
  if (!shareUrl || !shareUrl.includes('drive.google.com')) {
    return shareUrl;
  }

  const fileIdRegex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
  const match = shareUrl.match(fileIdRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }
  
  return shareUrl;
};

// Helper function to convert YouTube URL to embed URL
export const convertYouTubeToEmbed = (youtubeUrl) => {
  if (!youtubeUrl || !youtubeUrl.includes('youtube')) {
    return youtubeUrl;
  }

  const videoIdRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9-_]+)/;
  const match = youtubeUrl.match(videoIdRegex);
  
  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  return youtubeUrl;
};