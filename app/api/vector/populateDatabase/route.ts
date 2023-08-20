import { client } from "@/app/helpers/constants/weviate";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export async function GET(request: Request) {
    const dirRelativeToPublicFolder = "img2";
    const dir = path.resolve("./public", dirRelativeToPublicFolder);
    const filenames = readdirSync(dir);

    const promises = filenames.map(async (imgFile) => {
        const test = readFileSync(`${dir}/${imgFile}`);
        const b64 = Buffer.from(test).toString("base64");

        await client.data
            .creator()
            .withClassName("Covered")
            .withProperties({ image: b64, text: imgFile })
            .do();
    });

    await Promise.all(promises);

    return new Response("Ok");
}
