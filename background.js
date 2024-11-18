chrome.action.onClicked.addListener((tab) => {
  const url = tab.url;

  if (
    url.includes("youtube.com/watch") ||
    url.includes("youtube.com/@") ||
    url.includes("youtube.com/shorts/")
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeAndOpenSocialBlade
    });
  } else {
    alert("This extension only works on YouTube video, Shorts, or channel pages.");
  }
});

function scrapeAndOpenSocialBlade() {
  let channelName = "";

  function getChannelName() {
    if (window.location.href.includes("youtube.com/watch")) {
      // Regular video page
      const videoOwnerLink = document.querySelector('ytd-video-owner-renderer a[href*="/@"]');
      if (videoOwnerLink) {
        channelName = videoOwnerLink.href.split("/").pop();
      }
    } else if (window.location.href.includes("youtube.com/shorts")) {
      // Updated targeting for Shorts
      const shortsChannelLink = document.querySelector(
        'yt-reel-channel-bar-view-model a[href*="/@"]'
      );
      if (shortsChannelLink) {
        channelName = shortsChannelLink.href.split("/").pop();
      }
    } else if (window.location.href.includes("youtube.com/@")) {
      // Channel page
      const pathParts = window.location.pathname.split("/");
      channelName = pathParts[1]; // Extract "@ChannelName"
    }

    return channelName;
  }

  function openSocialBlade() {
    if (channelName) {
      const socialBladeUrl = `https://socialblade.com/youtube/${channelName}`;
      window.open(socialBladeUrl, "_blank");
    } else {
      alert("Channel information not found. Please try again on a valid YouTube video or Shorts.");
    }
  }

  // Immediate attempt to get the channel name
  channelName = getChannelName();
  if (channelName) {
    openSocialBlade();
    return;
  }

  // Use MutationObserver for dynamic content if initial attempt fails
  const observer = new MutationObserver(() => {
    channelName = getChannelName();
    if (channelName) {
      observer.disconnect(); // Stop observing once channel is detected
      openSocialBlade();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Failsafe: Stop observing after 5 seconds
  setTimeout(() => observer.disconnect(), 5000);
}