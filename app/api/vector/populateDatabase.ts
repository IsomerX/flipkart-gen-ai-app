// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/app/helpers/constants/weviate";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export default async function POST(request: Request) {
    const dirRelativeToPublicFolder = "img";
    const dir = path.resolve("./public", dirRelativeToPublicFolder);
    const filenames = readdirSync(dir);

    const promises = filenames.map(async (imgFile) => {
        const test = readFileSync(`${dir}/${imgFile}`);
        const b64 = Buffer.from(test).toString("base64");

        await client.data
            .creator()
            .withClassName("Cover")
            .withProperties({ image: b64, text: imgFile })
            .do();
    });

    await Promise.all(promises);

    new Response("Ok");
}
