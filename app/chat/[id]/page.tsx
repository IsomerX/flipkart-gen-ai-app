/* eslint-disable @next/next/no-img-element */
"use client";

import { db } from "@/firebase/firebase";
import { useSession } from "next-auth/react";
import { useCollection } from "react-firebase-hooks/firestore";

import {
    ArrowDownCircleIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";

import { ArrowDownIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import ScrollableFeed from "../../react-scrollable-feed";
import TextareaAutosize from "react-textarea-autosize";
// import useSWR from "swr";

import {
    collection,
    orderBy,
    query,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoadingScreen from "@/app/components/loadingScreen";

type Props = {
    params: {
        id: string;
    };
};

const ChatPage = ({ params: { id } }: Props) => {
    const { data: session } = useSession({
        required: true,
    });

    const [prompt, setPrompt] = useState("");
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const [chadProcessing, setChadProcessing] = useState(false);
    const [chadResponded, setChadResponded] = useState(false);

    const scrollableRef = useRef<ScrollableFeed>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const messageRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [finalPrompt, setFinalPrompt] = useState("");
    const [finalPromptLoading, setFinalPromptLoading] = useState(false);

    const [chadResponding, setChadResponding] = useState(false);
    const [scrollHeight, setScrollHeight] = useState(
        scrollRef.current?.scrollHeight
    );

    const [messages, loading] = useCollection(
        session &&
            query(
                collection(
                    db,
                    "users",
                    session.user?.email!,
                    "chats",
                    id,
                    "messages"
                ),
                orderBy("createdAt", "asc")
            )
    );

    useEffect(() => {
        if (scrollableRef.current && isAtBottom) {
            scrollableRef.current.scrollToBottom();
        }

        setTimeout(() => {
            setMounted(true);
        }, 1000);
    }, [messages, isAtBottom, scrollHeight]);

    // useSWR to get model
    // const { data: model } = useSWR("model", {
    //   fallbackData: "gpt-3.5-turbo",
    // });

    const model = "gpt-3.5-turbo";

    const autoTypingBotResponse = (text: string) => {
        let index = 0;

        setChadResponding(true);

        setTimeout(() => {
            let interval = setInterval(() => {
                if (index < text.length) {
                    if (messageRef.current) {
                        messageRef.current.textContent += text.charAt(index);
                        setScrollHeight(scrollRef.current?.scrollHeight);
                    }
                    index++;
                } else {
                    clearInterval(interval);

                    setChadResponding(false);

                    setTimeout(() => {
                        textareaRef.current?.focus();
                    }, 10);
                }
            }, 9);
        }, 21);
    };

    if (
        chadResponded &&
        messages?.docs[messages?.docs.length - 1]?.data().user.name === "Chad"
    ) {
        autoTypingBotResponse(
            messages?.docs[messages?.docs.length - 1]?.data().text.trimStart()
        );

        setChadResponded(false);
    }

    const getFinalImage = async () => {
        setFinalPromptLoading(true);
        await fetch("/api/final", {
            method: "POST",
            body: JSON.stringify({
                prompt: finalPrompt,
                session,
                id,
            }),
        })
            .then((r) => {
                if (r.ok) {
                    return r.blob().then((w) => {
                        return URL.createObjectURL(w);
                    });
                }
            })
            .then((uri) => {
                const message: Message = {
                    text: uri || "",
                    createdAt: serverTimestamp(),
                    user: {
                        _id: session?.user?.email,
                        name: "Chad",
                        avatar: "/chadgpt.png",
                    },
                };

                addDoc(
                    collection(
                        db,
                        "users",
                        session?.user?.email!,
                        "chats",
                        id,
                        "messages"
                    ),
                    message
                );
            });

        setFinalPrompt("");
        setFinalPromptLoading(false);
    };

    const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!prompt) return;

        const input = prompt.trim();

        if (input === "") return;

        setPrompt("");
        setChadProcessing(true);

        const message: Message = {
            text: input,
            createdAt: serverTimestamp(),
            user: {
                _id: session?.user?.email,
                name: session?.user?.name,
                avatar:
                    session?.user?.image ||
                    `https://ui-avatars.com/api/?name=${session?.user?.name}`,
            },
        };

        await addDoc(
            collection(
                db,
                "users",
                session?.user?.email!,
                "chats",
                id,
                "messages"
            ),
            message
        );

        //Toast Notification while processing...
        // const notification = toast.loading("Chad is processing...");

        const chatContext = messages?.docs.map((message) => {
            return {
                role:
                    message.data().user.name === "Chad" ? "assistant" : "user",
                content: message.data().text.trim() as string,
            };
        }) as GPTMessage[];

        // remember last 10 messages
        const last10Messages = chatContext?.slice(-10);

        const outboundMessages = [...(last10Messages as GPTMessage[])];

        const data: {
            response: string;
            gen: string;
        } = await fetch("/api/prompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                prompt: input,
                outboundMessages,
                id,
                model,
                session,
            }),
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                setChadProcessing(false);
                setChadResponded(true);
                return data;
                // Toast notification when successful!
                // toast.success("Chad has responded!", {
                //   id: notification,
                // });
            });
        if (data.gen) {
            if (data.gen.slice(0, 2) === "No") return;
            setFinalPrompt(data.gen);
            await fetch("/api/gen", {
                method: "POST",
                body: JSON.stringify({
                    prompt: data.gen,
                    session,
                    id,
                }),
            })
                .then((r) => {
                    if (r.ok) {
                        return r.blob().then((w) => {
                            return URL.createObjectURL(w);
                        });
                    }
                })
                .then((uri) => {
                    const message: Message = {
                        text: uri || "",
                        createdAt: serverTimestamp(),
                        user: {
                            _id: session?.user?.email,
                            name: "Chad",
                            avatar: "/chadgpt.png",
                        },
                    };

                    addDoc(
                        collection(
                            db,
                            "users",
                            session?.user?.email!,
                            "chats",
                            id,
                            "messages"
                        ),
                        message
                    );
                });
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            sendMessage(e as unknown as FormEvent<HTMLFormElement>);
        }
    };

    const updateIsAtBottomState = (result: boolean) => {
        setIsAtBottom(result);
    };

    const scrollToBottom = () => {
        scrollableRef.current?.scrollToBottom();

        if (chadResponding) {
            setIsAtBottom(true);
        }
    };

    const createChat = async () => {
        if (!messages?.empty) {
            const doc = await addDoc(
                collection(db, "users", session?.user?.email!, "chats"),
                {
                    // messages: [],
                    userId: session?.user?.email!,
                    createdAt: serverTimestamp(),
                }
            );

            router.push(`/chat/${doc.id}`);
        }
    };

    return (
        <>
            {finalPromptLoading && <LoadingScreen />}
            <div
                className="flex flex-col overflow-hidden"
                style={{ height: "100svh" }}
            >
                <div className="sticky top-0 md:hidden bg-[#343541] h-11 w-full">
                    <div className="flex relative items-center text-gray-300 h-full">
                        <div className="w-[16rem] inset-y-0 m-auto">
                            <p className="relative text-center text-base truncate">
                                {mounted &&
                                    (messages?.docs[
                                        messages?.docs.length - 1
                                    ]?.data().text ||
                                        "New Chat")}

                                <span
                                    className={`absolute inset-y-0 right-0 w-9 h-7 z-10 bg-gradient-to-l opacity-90 from-[#343541]`}
                                />
                            </p>
                        </div>

                        <button
                            onClick={createChat}
                            className="absolute right-5"
                        >
                            <PlusCircleIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Chat */}

                <ScrollableFeed
                    ref={scrollableRef}
                    onScroll={(isAtBottom: boolean) =>
                        updateIsAtBottomState(isAtBottom)
                    }
                    className={`flex-1 ${
                        !isAtBottom && "scroll-smooth"
                    } scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-[#202123] scrollbar-thumb-rounded-lg`}
                >
                    <div
                        id="scrollDiv"
                        ref={scrollRef}
                        className="overflow-y-auto overflow-x-hidden"
                    >
                        {messages?.empty && (
                            <>
                                <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl text-center mt-10">
                                    Write a prompt below to get started!
                                </p>
                                <ArrowDownCircleIcon className="text-gray-700 dark:text-gray-300 h-9 w-9 animate-bounce mx-auto mt-5" />
                            </>
                        )}

                        {loading && (
                            <div className="dot-spin m-auto mt-52"></div>
                        )}

                        {/* Message */}
                        {messages?.docs.map((message, i) => {
                            const isChad = message.data().user.name === "Chad";
                            if (
                                isChad &&
                                i === messages?.docs.length - 1 &&
                                chadResponding
                            )
                                return null;

                            if (!message.data().text) return null;
                            const messageString: string = message
                                .data()
                                .text.trimStart();

                            return (
                                <div
                                    key={i}
                                    className={`flex text-gray-700 dark:text-gray-300 ${
                                        isChad &&
                                        "bg-gray-100 dark:bg-[#434654]"
                                    } py-5 max-w-2xl mx-auto space-x-5 px-10`}
                                >
                                    <div className="shrink-0 object-cover">
                                        <Image
                                            unoptimized
                                            src={message.data().user.avatar}
                                            height={100}
                                            width={100}
                                            alt="avatar"
                                            className="h-7 w-7"
                                        />
                                    </div>

                                    <div className="max-w-2xl">
                                        {messageString.slice(0, 4) ===
                                        "blob" ? (
                                            <div ref={messageRef}>
                                                <img
                                                    className="text-base whitespace-pre-wrap"
                                                    src={messageString}
                                                    alt="chad response"
                                                />
                                            </div>
                                        ) : (
                                            <p
                                                ref={messageRef}
                                                className="text-base whitespace-pre-wrap"
                                            >
                                                {isChad &&
                                                i ===
                                                    messages?.docs.length - 1 &&
                                                chadResponding
                                                    ? null
                                                    : messageString.trimStart()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {!isAtBottom && (
                            <div className="absolute bottom-32 right-5 lg:bottom-36 xl:right-24">
                                <button
                                    type="button"
                                    onClick={scrollToBottom}
                                    disabled={isAtBottom}
                                    className={`${
                                        isAtBottom && "hidden"
                                    } inline-flex items-center p-2 rounded-full shadow-sm bg-gray-300 bg-opacity-70 active:bg-gray-500 dark:bg-gray-500 dark:bg-opacity-70 dark:active:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none`}
                                >
                                    <ArrowDownIcon
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </ScrollableFeed>

                {/* ChatPrompt */}
                <div className="bg-gray-300 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm mx-7 xl:mx-40 my-7 xl:my-10 flex gap-x-3">
                    <form
                        onSubmit={sendMessage}
                        className="flex items-center bg-white dark:bg-gray-700 shadow-lg rounded-lg space-x-5 p-3 w-full"
                    >
                        <TextareaAutosize
                            ref={textareaRef}
                            name="prompt"
                            autoComplete="off"
                            autoFocus
                            value={prompt}
                            rows={1}
                            maxRows={3}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={
                                !session || chadProcessing || chadResponding
                            }
                            className="flex-1 bg-transparent text-base break-words focus:outline-none disabled:cursor-not-allowed disabled:text-gray-300 overflow-y-auto resize-none scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-rounded-lg"
                            placeholder="Send a message..."
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            type="submit"
                            disabled={!session || !prompt || chadProcessing}
                            className={`bg-[#11A37F] ${
                                chadProcessing &&
                                "disabled:bg-[#11A37F] disabled:cursor-not-allowed"
                            } text-white ${
                                !chadProcessing &&
                                "active:bg-[#0C6952] disabled:bg-gray-300 disabled:active:bg-gray-300 dark:disabled:bg-gray-900/10 dark:disabled:active:bg-gray-900/10 disabled:cursor-not-allowed disabled:hover:opacity-100"
                            } self-end font-bold rounded px-3 py-2 h-7`}
                        >
                            {chadProcessing ? (
                                <span
                                    ref={loadingRef}
                                    className="loading"
                                ></span>
                            ) : (
                                <PaperAirplaneIcon className="h-3 w-3 -rotate-45" />
                            )}
                        </button>
                    </form>
                    {finalPrompt && (
                        <button
                            className="text-white bg-green-500 h-full w-[140px] px-3 rounded-lg"
                            onClick={getFinalImage}
                        >
                            I am done 👍🏻
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChatPage;
