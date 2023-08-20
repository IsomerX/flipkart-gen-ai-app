import { client } from "@/app/helpers/constants/weviate";

export async function GET(request: Request) {
    try {
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
            ],
        };

        await client.schema.classCreator().withClass(schemaConfig).do();
        const schemaRes = await client.schema.getter().do();
        new Response(JSON.stringify(schemaRes));
    } catch (e) {
        console.log(e);
        new Response(JSON.stringify({ message: "BAD", error: e }), {
            status: 500,
        });
    }
}
