# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

--

fix HTTP error! status: 403 on GEMINI model chat -- >

on choosing GEMINI Flash Lite -> it should use server-side Gemini API key, not client-side API key

--

for other models, it should use client-side API key BYOK key, check for existing logic and fix

--

Error response received
Object { errorText: '{"error":"VT+ subscription required","message":"Free users must provide their own Gemini API key. Upgrade to VT+ for server-side access to Gemini models.","upgradeUrl":"/pricing","usageSettingsAction":"open_usage_settings"}', status: 403 }
​
errorText: '{"error":"VT+ subscription required","message":"Free users must provide their own Gemini API key. Upgrade to VT+ for server-side access to Gemini models.","upgradeUrl":"/pricing","usageSettingsAction":"open_usage_settings"}'
​
status: 403

-> show this error message instead of "HTTP error! status: 403" error toast

--

--

fix motion animation too flashing and jizzy on both desktop and especially in mobile view port

--

fix close button on PWA install app bottom banner doesn't clickable and doesn't close the banner

--

only show PWA install app bottom banner on homepage (chat page at "/" route), do not show on other pages

--

fix layout on mobile, on logout and and small screen, the bottom footer is not visible under the chat input box

--

fix sidebar opening animation framer motion too flashing on mobile view port

--

fix DropdownMenu user floating button on mobile view port, increase z-index to be above the chat input box

--

integrate text-to-speech

--

fix MessageActions view appears too soon in layout, right after the message is sent, it should appear after LLM receive chat response.

--

fix settings modal layout check previous implementation

--

add badge in about page

<a href="https://devhub.best/projects/vt-chat" target="_blank" title="DevHub Top 1 Daily Winner">
  <img
    src="https://devhub.best/images/badges/top1-light.svg"
    alt="DevHub Top 1 Daily Winner"
    style="width: 195px; height: auto;"
  />
</a>

--

fix chat detail still flashing on new message received, should not flash, just smoontly scroll to bottom and pin the user message to top of page like ChatGPT and Claude

--

Accessiblity settings: reduce motion -> disable all framer motion in the app

--

fix every error toast sonner to have a close button and dismissable on tap

--

fix send chat button in chat input spinner doesn't animate and rotate when sending chat
