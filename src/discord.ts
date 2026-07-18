// Helper lib for dealing with http reqs

async function get<T>(url: string): Promise<T> {
    const res = await fetch(`https://discord.com/api/${url}`, {
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
        }
    });
    return await res.json() as Promise<T>;
}

async function post<T>(url: string, body: any): Promise<T> {
    const res = await fetch(`https://discord.com/api/${url}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
    return await res.json() as Promise<T>;
}

export { get, post }