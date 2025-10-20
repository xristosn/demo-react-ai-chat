# Demo - Client-Side AI Chatbot

A fully **client-side AI text chatbot** that streams responses in real time, with persistent chats, API keys, system prompts and user settings, all saved locally in the browser. The app is fully responsive and works seamlessly across desktop and mobile devices.

Built with **Vite v7.1.7**, **React v19.1.1**, **Shadcn components**, **Tailwind CSS** and **Framer Motion**.

---

## ✨ Features

### 🧑‍💻 Chat Functionality

- Fully client-side AI chatbot with streaming responses.
- All chat history, API keys, system prompts and settings are saved in the browser.
- Chat responses are rendered using **react-markdown** for rich text formatting.
- Smooth UI animations with **Framer Motion**.
- Sidebar displays previous chats with the ability to:
  - Rename chats
  - Delete chats
  - Switch between chats

### 🌐 Multiple Providers

- Supports the following AI providers:
  - **OpenAI**
  - **OpenRouter**
  - **Claude**
  - **Groq**
  - **Perplexity**
  - **Demo** (simulated streaming responses for testing/demo purposes)
- Users can select any model available for the chosen provider.
- The app architecture allows virtually **any OpenAI-compatible API** to be added by updating `src/lib/chat-providers.ts`.

### 🛠 Tool Support

- Full **tool calling support** within chats.
- Currently supported tools:
  - **Current Datetime** – Returns the current date and time in various timezones.
  - **Instant Search** – Fetches factual answers, summaries, and related topics (**not a web search**).
  - **Web Search** – Only if supported by the selected provider.
- **Zod** is used for tool definitions and validation.
- Additional tools can be easily added via `src/lib/tools.ts`.

### 🔑 API Key Management

- Dedicated component for managing API keys.
- Keys are stored securely in the browser.
- Users can add, edit, or remove keys without leaving the app.

### 📄 System Prompts / Templates

- Sidebar includes reusable **Templates** to guide AI responses.
- Users can:
  - Use preset templates
  - Create and save custom templates
  - Manage templates directly in the UI

### ⚡ Real-Time Streaming

- Responses are streamed live to the chat window.
- Streaming ensures a smooth user experience without waiting for full responses.
- Compatible with all supported providers.

### 🖥️ Fully Responsive

- Desktop and mobile layouts supported.
- Sidebar collapsible on smaller screens for a seamless chat experience.

---

## 🧰 Tech Stack

| Area               | Technology                                                   | Notes                                       |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------- |
| Build Tool         | [Vite v7.1.7](https://vitejs.dev/)                           | Fast dev & optimized builds                 |
| Framework          | [React v19.1.1](https://react.dev/)                          | Modern React features                       |
| UI Components      | [Shadcn UI](https://ui.shadcn.com/)                          | Modular, reusable components                |
| Styling            | Tailwind CSS                                                 | Utility-first, responsive design            |
| Animations         | [Framer Motion](https://www.framer.com/motion/)              | Smooth UI animations                        |
| Markdown Rendering | [react-markdown](https://github.com/remarkjs/react-markdown) | Renders AI responses with rich formatting   |
| API SDK            | [OpenAI JS SDK](https://www.npmjs.com/package/openai)        | Client-side integration for OpenAI provider |
| Tool Validation    | [Zod](https://github.com/colinhacks/zod)                     | Strong schema validation for tools          |
| State Persistence  | Browser storage (localStorage)                               | Saves chats, API keys, settings, templates  |

## 📄 License

[MIT](https://github.com/xristosn/demo-react-ai-chat/blob/main/LICENSE)

⭐ If you like this project, don’t forget to give it a star on GitHub
