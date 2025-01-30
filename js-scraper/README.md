How to run? 

First run this,
brave-browser --remote-debugging-port=9222 --user-data-dir="/home/gabriel/.config/BraveSoftware/Brave-Browser" --profile-directory="Profile 2"

Open new terminal and run this to get the websocket url 
curl http://localhost:9222/json/version | grep webSocketDebuggerUrl

Replace the websocket url and Run the scraper script to start scraping.