# DeweyImages API
DeweyImages is a somewhat satirical stock photo website,
where people can purchase images from their authors using DeweyCoins.

## Running
First you'll have to make the directories `images/full` and `images/preview`
this is because i'm a lazy fuck and didn't do it programatically.\
Next, make a `.env` file in the root directory,
and fill it out with the following:
```
SESSION_SECRET= # This will be used to encrypt cookies and such
DISCORD_TOKEN=  # The token of your Discord bot
CLIENT_ID=      # You can find this where you set up your bots oAuth2
CLIENT_SECRET=  # ^

OAUTH_URL=      # A discord oAuth2 url
GUILD_ID=       # The id of your Discord server
API_PATH=       # * /api
API_URL=        # * https://api.example.com
WEB_URL=        # * https://example.com
PORT=           # * 8080

TESTING=        # set to true for local testing and stuff
```
<sub>Examples marked with `*`, replace them with whatever </sub>

Then, you should be able to just do `npm install`
and run the api with `npx tsx src/main.ts` !

You can read more about the structure of the api [here](project.md)