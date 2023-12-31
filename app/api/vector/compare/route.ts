// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from "fs/promises";
import type { NextApiRequest } from "next";
import path from "path";
import formidable from "formidable";
import { readFileSync } from "fs";
import { client } from "@/app/helpers/constants/weviate";

const should_save = true;

const readFile = (
    req: Request,
    saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const options: formidable.Options = {};
    if (saveLocally) {
        options.uploadDir = path.join(process.cwd(), "public/img");
        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }

    const form = formidable(options);
    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

export async function POST(request: Request) {
    try {
        await fs.readdir(path.join(process.cwd() + "/public", "/img"));
    } catch (error) {
        await fs.mkdir(path.join(process.cwd() + "/public", "/img"));
    }

    const testos = await readFile(request, should_save);
    const test = Buffer.from(
        readFileSync(testos.files.myImage?.filepath)
    ).toString("base64");

    const resImage = await client.graphql
        .get()
        .withClassName("Cover")
        .withFields("image")
        .withNearImage({ image: test })
        .withLimit(3)
        .do();

    if (should_save) {
        await client.data
            .creator()
            .withClassName("Cover")
            .withProperties({
                image: test,
                text: testos.files.myImage?.newFilename,
            })
            .do();
    }
    const mapped = resImage.data.Get.Cover.map((e, index) => {
        const result = resImage.data.Get.Cover[index].text;
        return result;
    });
    return new Response(
        JSON.stringify({
            baseImg: testos.files.myImage?.newFilename,
            data: mapped,
        })
    );
}
