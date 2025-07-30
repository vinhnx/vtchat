# TODO

--

ok go-> https://vtchat.io.vn/

---

Research and rename "VT" to better and memorable name

-

integrate text-to-speech

--

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

Add new Accessiblity settings: reduce motion -> disable all framer motion in the app

--

fix every error toast sonner to have a close button and dismissable on tap

--

fix send chat button in chat input spinner doesn't animate and rotate when sending chat

--

fix safari layout not center

--

fix free web search with gemini flash doesn't work, it should use client-side API key BYOK key, check for existing logic and fix

curl 'https://vtchat.io.vn/api/completion' \
-X POST \
-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0' \
-H 'Accept: _/_' \
-H 'Accept-Language: en-US,en;q=0.5' \
-H 'Accept-Encoding: gzip, deflate, br, zstd' \
-H 'Content-Type: application/json' \
-H 'Referer: https://vtchat.io.vn/chat/bNwPU1yVLw' \
-H 'Origin: https://vtchat.io.vn' \
-H 'DNT: 1' \
-H 'Sec-GPC: 1' \
-H 'Sec-Fetch-Dest: empty' \
-H 'Sec-Fetch-Mode: cors' \
-H 'Sec-Fetch-Site: same-origin' \
-H 'Connection: keep-alive' \
-H 'Cookie: **Secure-better-auth.session_token_multi-dv1kpin9stwkyspmatninj6inj34j6q4=dV1KpiN9STWkysPmaTninJ6InJ34J6q4.oZ8DLyzC7P%2Fu1U4pILE0bS0ViMvD6SyU%2FgQeOf7VQ%2Bs%3D; **Secure-better-auth.session_token_multi-izvqcrcrkn1zqbiwhemrmweavjebxzgi=iZVqCRCRKn1zQBIwhemrMWeaVJEBxZGi.I%2B%2BlN4NgtdwzKtlq9Yl3YAgsU9Dv7YeQl0H0Dm9b69A%3D; **Secure-better-auth.session_token_multi-ropjyrbujq5kdb5eghelx39oxjk9rqj6=roPjYRbuJQ5KdB5EgheLx39OxJK9Rqj6.TYU8myxsBYafQMRa%2Fdp8CVGqsl8dmG1ub5sRktu7nzM%3D; **Secure-better-auth.session_token_multi-zht7fuxtnkssi51vulhdojlkcy5fo9sf=ZhT7FuxtnKSSi51vulHdoJLkcy5FO9sf.TA7v2J%2Fkrte2scRfQONEDHIrvi4MFt%2FbHNaDVawgX2o%3D; **Secure-better-auth.session_token=SaAYAOdX2A9erF0MuKAXnKB8ak9c87Gu.5ZWSzFKzat7KCfK%2FvahZpPFUOL%2FC%2Bbs35QEWeZzn7TM%3D; **Secure-better-auth.session_data=eyJzZXNzaW9uIjp7InNlc3Npb24iOnsiZXhwaXJlc0F0IjoiMjAyNS0wOC0wNlQwNDo0NzowOS45NTlaIiwidG9rZW4iOiJTYUFZQU9kWDJBOWVyRjBNdUtBWG5LQjhhazljODdHdSIsImNyZWF0ZWRBdCI6IjIwMjUtMDctMzBUMDQ6NDc6MDkuOTU5WiIsInVwZGF0ZWRBdCI6IjIwMjUtMDctMzBUMDQ6NDc6MDkuOTU5WiIsImlwQWRkcmVzcyI6IjEyMy4yNS4xMzEuMTc4IiwidXNlckFnZW50IjoiTW96aWxsYS81LjAgKE1hY2ludG9zaDsgSW50ZWwgTWFjIE9TIFggMTAuMTU7IHJ2OjE0MS4wKSBHZWNrby8yMDEwMDEwMSBGaXJlZm94LzE0MS4wIiwidXNlcklkIjoiNmQwODUxZGYtZTIxMy00ODZiLThlZjMtYWVjNGM3ZTNlMjNjIiwiaW1wZXJzb25hdGVkQnkiOm51bGwsImlkIjoiZmIzZDRjNjUtNjVkYi00Y2MwLWFhM2ItZTM4ZjAzYzg5NDJmIn0sInVzZXIiOnsibmFtZSI6IkNoYXQgVlQiLCJlbWFpbCI6ImNoYXR2dC5pb0BnbWFpbC5jb20iLCJlbWFpbFZlcmlmaWVkIjp0cnVlLCJpbWFnZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0o2bW9FVjI2Vm14VHFVZ3JMUGJEaXh6U0Q5M0dVQ0lSYi1NdDlLZlhZdDBMV2hCOFE9czk2LWMiLCJjcmVhdGVkQXQiOiIyMDI1LTA3LTMwVDA0OjQ3OjA5LjkzN1oiLCJ1cGRhdGVkQXQiOiIyMDI1LTA3LTMwVDA0OjQ3OjA5LjkzN1oiLCJub3JtYWxpemVkRW1haWwiOiJjaGF0dnRpb0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImJhbm5lZCI6ZmFsc2UsImJhblJlYXNvbiI6bnVsbCwiYmFuRXhwaXJlcyI6bnVsbCwiaWQiOiI2ZDA4NTFkZi1lMjEzLTQ4NmItOGVmMy1hZWM0YzdlM2UyM2MifX0sImV4cGlyZXNBdCI6MTc1Mzg1MjYyOTk3NSwic2lnbmF0dXJlIjoiZXJsQ3NnN1dwTWF1eEtpY0trSzJzMWhaYjdqaEd6R3pkZE1BMzZLUHBqUSJ9' \
-H 'Priority: u=4' \
-H 'Pragma: no-cache' \
-H 'Cache-Control: no-cache' \
-H 'TE: trailers' \
--data-raw '{"mode":"gemini-2.5-flash-lite-preview-06-17","prompt":"who is vinhnx","threadId":"bNwPU1yVLw","messages":[{"role":"user","content":"who is vinhnx?"},{"role":"assistant","content":""},{"role":"user","content":"who is vinhnx"}],"threadItemId":"dTCf9pYxkE","customInstructions":"","parentThreadItemId":"","webSearch":true,"mathCalculator":false,"charts":false,"showSuggestions":true,"apiKeys":{},"userTier":"FREE"}'

event: status
data: {"type":"status","threadId":"bNwPU1yVLw","threadItemId":"dTCf9pYxkE","parentThreadItemId":"","query":"who is vinhnx","mode":"gemini-2.5-flash-lite-preview-06-17","webSearch":true,"showSuggestions":true,"status":"PENDING"}

event: error
data: {"type":"error","threadId":"bNwPU1yVLw","threadItemId":"dTCf9pYxkE","parentThreadItemId":"","query":"who is vinhnx","mode":"gemini-2.5-flash-lite-preview-06-17","webSearch":true,"showSuggestions":true,"error":{"error":"An unexpected error occurred while processing your request. Please try again or contact support if the issue persists.","status":"ERROR"}}

event: done
data: {"type":"done","status":"complete","threadId":"bNwPU1yVLw","threadItemId":"dTCf9pYxkE","parentThreadItemId":""}

--

getPreviousThreadItems called without threadId

--

fix hover on "new chat" button show a tool tip but the tooltip is not visible and being clipped by the sidebar

--

Fix "Install VT App" PWA banner close button not clickable and not whole banner is not dismissable on tap

--

fix models modal selection width not fit on mobile view port

--


