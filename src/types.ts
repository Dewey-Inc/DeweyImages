import db from "./db";
import assert from 'node:assert';
import * as discord from "./discord";
import sharp from "sharp"
import fs from "fs"

/**
 * A class that represents a user.
 */
class User {
    /**
     * @param id the Discord id of the user
     * @param username the user's uniqe Discord username
     * @param displayname the user's Discord nickname/displayname
     * @param permission the user's permission level, read README for more info
     * @param avatar the user's Discord avatar
     */
    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly displayname: string | undefined,
        public permission: number,
        public readonly avatar: string,
    ) {}

    /**
     * Changes a user's permission level.
     */
    setPermission(permission: number) {
        this.permission = permission
        db.prepare('UPDATE users SET permission = ? WHERE id = ?')
            .run(permission, this.id);
    }

    /** All images the user has submitted. */
    get images() {
        let images: Array<Image> = []
        db.prepare('SELECT rowid FROM images WHERE authorid = ?')
            .all(this.id).forEach(({ rowid }) => {
                assert(typeof rowid === "number")
                const image = Image.get(rowid)
                assert(image)
                images.push(image)
            })
        return images
    }

    /**
     * Returns a User object with the given id
     * @param id The user's Discord id
     * @returns A User object if a valid user is found, no value will be returned otherwise
     */
    static async get(id: string) {
        let user = await discord.get(`/guilds/${process.env.GUILD_ID}/members/${id}`) as any; // me when bad practice
        if (!user.user) {
            return
        }

        // me when i store you personal information (i'm evil)
        db.prepare('INSERT OR IGNORE INTO users (id, permission) VALUES (?, ?)')
            .run(id, 1);
        const perm = db.prepare('SELECT permission FROM users WHERE id = ?')
            .get(id);
        assert(perm !== undefined && typeof perm.permission === "number")
        const avatar = user.avatar
            ? `https://cdn.discordapp.com/guilds/${process.env.GUILD_ID}/users/${id}/avatars/${user.avatar}.webp`
            : `https://cdn.discordapp.com/avatars/${id}/${user.user.avatar}.webp`;

        return new User(
            id,
            user.user.username,
            user.nick || user.user.global_name,
            perm.permission,
            avatar
        );
    }
}

/**
 * A class that represents an image.
 */
class Image {

    /**
     * @param id The image's unique id
     * @param resolution The resolution of the original image file
     * @param cost The cost of the image in DeweyCoins
     * @param timestamp The time the image was uploaded
     * @param authorid The Discord id of the Image's author
     * @param title The image's author
     * @param description The image's description
     * @param tags A list of tags used to categorize the image
     */
    constructor(
        public id: number,
        public resolution: string,
        public cost: number,
        public timestamp: number,
        public authorid: string,
        public title: string,
        public description: string,
        public tags: Array<string>,
        public approved: boolean
    ) {}

    static get(id: number) {
        const res = db.prepare('SELECT * FROM images WHERE rowid = ?')
            .get(id);
        if (!res) {
            return
        }
        assert(
            typeof res.resolution === "string" && // ts is both a blessing and a curse istg
            typeof res.cost === "number" &&
            typeof res.timestamp === "string" &&
            typeof res.authorid === "string" &&
            typeof res.title === "string" &&
            typeof res.description === "string" &&
            typeof res.tags === "string" &&
            typeof res.approved === "number"
        )

        return new Image(
            id,
            res.resolution,
            res.cost,
            parseInt(res.timestamp),
            res.authorid,
            res.title,
            res.description,
            JSON.parse(res.tags),
            !!res.approved
        )
    }

    /** Removes the image from the database */
    delete() {
        db.prepare('DELTE FROM images WHERE rowid = ?')
            .run(this.id)
    }

    /**
     * Modifies the image
     */
    modify({approved, cost, title, description, tags} : {approved?: boolean, cost?: number, title?: string, description?: string, tags?: Array<string>}) {
        this.approved = approved || this.approved
        this.cost = cost || this.cost
        this.title = title || this.title
        this.description = description || this.description
        this.tags = tags || this.tags
        db.prepare('UPDATE images SET (status, cost, title, description, tags) VALUES (?, ?, ?, ?)  WHERE rowid = ?')
            .run(+this.approved, this.cost, this.title, this.description, JSON.stringify(this.tags), this.id);
        return
    }

    /**
     * Creates an image and returns an image object
     * @param path The location of the (temporary) image file
     * @param cost The cost of the image in DeweyCoins
     * @param authorid The Discord id of the Image's author
     * @param title The image's author
     * @param description The image's description
     * @param tags A list of tags used to categorize the image
     * @returns The image's unique id
     */
    static async new(path: string, cost: number, authorid: string, title: string, description: string, tags: Array<String>) {
        const metadata = await sharp(path)
            .metadata()

        const res = db.prepare('INSERT INTO images (resolution, cost, authorid, title, description, tags) VALUES (?, ?, ?, ?, ?, ?)')
            .run(`${metadata.width}x${metadata.height}`, cost, authorid, title, description, JSON.stringify(tags));
        assert(typeof res.lastInsertRowid === "number") // probably fine (could be bigint)

        const image = Image.get(res.lastInsertRowid);
        assert(image)

        const sucess = await this.saveImage(image, metadata, path)
        return { image, sucess }
    }

    private static async saveImage(image: Image, metadata: sharp.Metadata, path: string) {
        try {
            sharp(path)
                .resize({ fit: "inside", height: Math.min(2160, metadata.height) })
                .toFile(`images/full/${image.id}.jpeg`)

            const overlay = await sharp("src/assets/tile.svg")
                .resize({ height: Math.round(metadata.height/1.8) })
                .toBuffer()

            const dew = await sharp("src/assets/dewart.png")
                .resize({ height: metadata.height, width: metadata.width, fit: "inside" })
                .toBuffer()

            await sharp(path)
                .resize({ fit: "inside", height: Math.min(1080, metadata.height) })
                .composite([
                    { input: overlay, tile: true, gravity: "center" },
                    { input: dew, gravity: "south" }
                ])
                .toFile(`images/preview/${image.id}.jpeg`)
            fs.unlink(path, () => {})
            return true
        } catch(err) {
            return false
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        userid: string;
        state: string;
    }
}
export { User, Image }