import openai from "@/lib/configuration";

export async function GET() {
    const modelOptions = [
        { value: "text-davinci-001", label: "text-davinci-001" },
        {
            value: "text-search-curie-query-001",
            label: "text-search-curie-query-001",
        },
        { value: "gpt-3.5-turbo", label: "gpt-3.5-turbo" },
        { value: "davinci", label: "davinci" },
        { value: "gpt-3.5-turbo-0613", label: "gpt-3.5-turbo-0613" },
        { value: "babbage", label: "babbage" },
        { value: "text-babbage-001", label: "text-babbage-001" },
        { value: "curie-instruct-beta", label: "curie-instruct-beta" },
        { value: "text-davinci-003", label: "text-davinci-003" },
        { value: "davinci-similarity", label: "davinci-similarity" },
        { value: "code-davinci-edit-001", label: "code-davinci-edit-001" },
        {
            value: "text-similarity-curie-001",
            label: "text-similarity-curie-001",
        },
        { value: "ada-code-search-text", label: "ada-code-search-text" },
        {
            value: "text-search-ada-query-001",
            label: "text-search-ada-query-001",
        },
        {
            value: "gpt-3.5-turbo-16k-0613",
            label: "gpt-3.5-turbo-16k-0613",
        },
        { value: "babbage-search-query", label: "babbage-search-query" },
        { value: "ada-similarity", label: "ada-similarity" },
        { value: "text-curie-001", label: "text-curie-001" },
        { value: "gpt-3.5-turbo-16k", label: "gpt-3.5-turbo-16k" },
        {
            value: "text-search-ada-doc-001",
            label: "text-search-ada-doc-001",
        },
        {
            value: "text-search-babbage-query-001",
            label: "text-search-babbage-query-001",
        },
        {
            value: "code-search-ada-code-001",
            label: "code-search-ada-code-001",
        },
        { value: "curie-search-document", label: "curie-search-document" },
        {
            value: "text-search-davinci-query-001",
            label: "text-search-davinci-query-001",
        },
        {
            value: "text-search-curie-doc-001",
            label: "text-search-curie-doc-001",
        },
        {
            value: "babbage-search-document",
            label: "babbage-search-document",
        },
        {
            value: "babbage-code-search-text",
            label: "babbage-code-search-text",
        },
        {
            value: "text-embedding-ada-002",
            label: "text-embedding-ada-002",
        },
        { value: "davinci-instruct-beta", label: "davinci-instruct-beta" },
        { value: "davinci-search-query", label: "davinci-search-query" },
        {
            value: "text-similarity-babbage-001",
            label: "text-similarity-babbage-001",
        },
        { value: "text-davinci-002", label: "text-davinci-002" },
        {
            value: "code-search-babbage-text-001",
            label: "code-search-babbage-text-001",
        },
        {
            value: "text-search-davinci-doc-001",
            label: "text-search-davinci-doc-001",
        },
        {
            value: "code-search-ada-text-001",
            label: "code-search-ada-text-001",
        },
        { value: "ada-search-query", label: "ada-search-query" },
        {
            value: "text-similarity-ada-001",
            label: "text-similarity-ada-001",
        },
        { value: "ada-code-search-code", label: "ada-code-search-code" },
        { value: "whisper-1", label: "whisper-1" },
        { value: "text-davinci-edit-001", label: "text-davinci-edit-001" },
        {
            value: "davinci-search-document",
            label: "davinci-search-document",
        },
        { value: "curie-search-query", label: "curie-search-query" },
        { value: "babbage-similarity", label: "babbage-similarity" },
        { value: "ada", label: "ada" },
        { value: "ada-search-document", label: "ada-search-document" },
        { value: "text-ada-001", label: "text-ada-001" },
        {
            value: "text-similarity-davinci-001",
            label: "text-similarity-davinci-001",
        },
        { value: "curie-similarity", label: "curie-similarity" },
        {
            value: "babbage-code-search-code",
            label: "babbage-code-search-code",
        },
        {
            value: "code-search-babbage-code-001",
            label: "code-search-babbage-code-001",
        },
        {
            value: "text-search-babbage-doc-001",
            label: "text-search-babbage-doc-001",
        },
        { value: "gpt-3.5-turbo-0301", label: "gpt-3.5-turbo-0301" },
        { value: "curie", label: "curie" },
    ];

    return new Response(JSON.stringify({ modelOptions }), {
        status: 200,
    });
}
