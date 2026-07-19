# Objects
### User object
| Field        | Type   | Description                         |
| ------------ | ------ | ----------------------------------- |
| id           | String | Discord id of the user              |
| username     | String | Unique Discord username             |
| displayname? | String | User's displayname                  |
| avatar?      | String | A url to the user's profile picture |
| permission   | Int    | The user's permission level         |

### Image object
| Field        | Type   | Description                                                |
| ------------ | ------ | ---------------------------------------------------------- |
| id           | Int    | An id unique to the image                                  |
| approved     | Bool   | Whether the image has been approved by moderators          |
| resolution   | Array  | The resolution of the highest quality version of the image |
| cost         | Int    | The price of the image in DeweyCoins                       |
| timestamp    | Int    | The time the image was uploaded as a unix timestamp        |
| authorid     | String | The author's Discord id                                    |
| title        | String | The title of the image                                     |
| description? | String | Take a guess                                               |
| tags?        | Array  | A list of tags used to categorize the image                |


### Purchase object (this isn't exposed to users)
| Field        | Type   | Description            |
| ------------ | ------ | ---------------------- |
| userid       | String | Discord id of the user |
| imageid      | Int    | The image's unique id  |

# Permissions

| Permission level | User standing |
| ---------------- | ------------- |
| -1               | Banned        |
| 0                | Unregistered  |
| 1                | User          |
| 2                | Moderator     |

# API endpoints

## Authentication
### Starting the auth flow
**`GET`** `/auth/start`\
This endpoint will start the authentication process and redirect users to the Discord oAuth2 page.

### Authorizing
**`GET`** `/auth/final`\
Useres will get redirected here from the Discord oAuth2 page.

## User stuff
### Getting information about a user
**`GET`** `/users/{User.id}`\
Returns a User object.

### Getting images posted by a user
**`GET`** `/users/{User.id}/images`\
Returns a list of Image object.

### KILL user
**`DELETE`** `/users/{User.id}`\
Must be a moderator to execute.\
Sets a user's permission level to -1.

## Image stuff
### Getting information about an image
**`GET`** `/images/{Image.id}`\
Returns an Image object.

### Downloading a preview
**`GET`** `/images/{Image.id}/preview`\
Returns a version of the image with a watermark.

### Buying a DeweyPremium™ HighScale™ DeweyImage™
**`GET`** `/images/{Image.id}/purchase`\
The user must have permission 1 or higher and must have enough DeweyCoins to buy the image.\
The cost of the image will be transfered from the user to the image's author.

### Downloading a DeweyPremium™ HighScale™ DeweyImage™
**`GET`** `/images/{Image.id}/download`\
The user must have purchased the image before downloading it.

Query string params
| Field       | Type   | Description                                                               |
| ----------- | ------ | ------------------------------------------------------------------------- |
| resolution? | String | Changes the resolution of the returned image. Must be <= Image.resolution |
>!! i might not add this resolution thing idk if i care enough


### Submitting an image
**`POST`** `/images`\
The user must have permission 1 or higher.\
Returns an Image object.

Form params
| Field        | Type   | Description                                 |
| ------------ | ------ | ------------------------------------------- |
| image        | File   | The submitted image                         |
| cost         | Int    | The price of the image in DeweyCoins        |
| title        | String | The title of the image                      |
| description? | String | if you'd like to de your scription          |
| tags?        | Array  | A list of tags used to categorize the image |

<sub>fields marked as optional may be changed by moderators before publishing.</sub>

### Editing an image
**`PATCH`** `/images/{image.id}`\
The user must be the author of the image or a moderator.\
Changes information related to an image. The image will be marked as unapproved unless done by a moderator.\
Returns an Image object.

JSON params
| Field        | Type   | Description                                 |
| ------------ | ------ | ------------------------------------------- |
| cost?        | Int    | The price of the image in DeweyCoins        |
| title?       | String | The title of the image                      |
| description? | String | if you'd like to de your scription          |
| tags?        | Array  | A list of tags used to categorize the image |

### Deleting an image
**`DELETE`** `/images/{image.id}`\
The user must be the author of the image or a moderator.

### Approving an image
**`PATCH`** `/images/{image.id}/approves`\
The user must be a moderator.\
Returns an Image object.

# TODO:
* Add proper support for purchasing and downloading DeweyPremium™ HighScale™ DeweyImages™
* Image search
* Endpoint to get unapproved images
