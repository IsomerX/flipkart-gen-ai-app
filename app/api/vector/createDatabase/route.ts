// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { client } from "@/app/helpers/constants/weviate";
import { readFileSync, readdirSync } from "fs";
import path from "path";

export async function GET(request: Request) {
    const schemaConfig = {
        class: "Covered",
        vectorizer: "img2vec-neural",
        vectorIndexType: "hnsw",
        moduleConfig: {
            "img2vec-neural": {
                imageFields: ["image"],
            },
        },
        properties: [
            {
                name: "image",
                dataType: ["blob"],
            },
            {
                name: "text",
                dataType: ["string"],
            },
        ],
    };

    await client.schema.classCreator().withClass(schemaConfig).do();
    const schemaRes = await client.schema.getter().do();

    return new Response(JSON.stringify(schemaRes));
}
