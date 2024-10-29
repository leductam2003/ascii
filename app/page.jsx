"use client"
import React, { useState, useRef, useEffect } from "react";
import { FiSend } from "react-icons/fi";

const TerminalChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "system",
      content: "Welcome to the ASCII Art Generator! Send a message below, and the AI will generate an ASCII art for you. Our official contract address: 4aG5MfL2ZbXNFu3BAsgdtfVpRDnHhtM86f7Spr9Xpump"
    },
    {
      id: 2,
      type: "ascii",
      content: `
   _____                    _             _ 
  |_   _|__ _ __ _ __ ___ (_)_ __   __ _| |
    | |/ _ \ '__| '_ ' _ \| | '_ \ / _' | |
    | |  __/ |  | | | | | | | | | | (_| | |
    |_|\___|_|  |_| |_| |_|_|_| |_|\__,_|_|
      `
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputMessage
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    const thinkingMessage = {
      id: messages.length + 2,
      type: "system",
      content: "..."
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `
            ${inputMessage}
            Create an ASCII art that visually represents the request. (Only give ASCII art, do not say anything more)
        `}),
      });

      const data = await response.json();
      const systemResponse = {
        id: messages.length + 3,
        type: "system",
        content: data.answer.replaceAll("```", "") || "No response from OpenAI."
      };
      setMessages((prev) => [...prev, systemResponse]);
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      const errorMessage = {
        id: messages.length + 3,
        type: "system",
        content: "Error processing command."
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col">
      <div className="max-w-4xl w-full mx-auto bg-black rounded-lg shadow-lg overflow-hidden flex flex-col flex-grow">
        <div className="p-2 bg-gray-800 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-400 text-sm font-mono ml-2">Terminal Chat</span>
        </div>

        <div
          className="flex-grow p-4 overflow-y-auto font-mono text-sm"
          style={{ maxHeight: "calc(100vh - 200px)" }}
          role="log"
          aria-live="polite"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.type === "user" ? "text-green-400" : message.type === "ascii" ? "text-blue-400" : "text-gray-300"}`}
            >
              <div className="flex items-start">
                <span className="mr-2">{message.type === "user" ? ">" : "$"}</span>
                <pre className="whitespace-pre-wrap break-words">
                  {message.content}
                </pre>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          className="p-4"
        >
          <div className="flex items-center space-x-2">
            <span className="text-green-400 font-mono"></span>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow bg-transparent text-gray-300 font-mono focus:outline-none"
              placeholder="Type your message..."
              aria-label="Type your message"
            />
            <button
              type="submit"
              className="p-2 text-gray-400 hover:text-green-400 transition-colors duration-200"
              aria-label="Send message"
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TerminalChat;