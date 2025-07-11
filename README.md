<div align="center">
  <img src="[https://raw.githubusercontent.com/marksocrates1111/mongpt-dapp/main/public/logo.png](https://raw.githubusercontent.com/marksocrates1111/mongpt-dapp/refs/heads/main/MonGPT.jpg)" alt="MonGPT Logo" width="150">
  <h1>MonGPT</h1>
  <p>
    <b>The Analytical Consciousness of the Monad Blockchain</b>
  </p>
  <p>
    An AI-powered security and analysis tool built for the high-performance Monad ecosystem.
  </p>
  
  <a href="https://mongpt.marksocratests.xyz/">
    <img src="https://img.shields.io/badge/Live%20Demo-▲%20Vercel-black?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/marksocrates1111/mongpt-dapp/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge" alt="License">
  </a>
  <a href="https://monad.xyz/">
    <img src="https://img.shields.io/badge/Powered%20by-Monad-violet?style=for-the-badge" alt="Powered by Monad">
  </a>

</div>

---

**MonGPT** is a next-generation AI assistant designed to operate natively within the Monad ecosystem. It leverages the synthesis of the world's most powerful language models to provide unparalleled analysis for developers, security researchers, and users on the Monad blockchain.

The core innovation of MonGPT is its on-chain interaction model. Every analytical prompt submitted by a user is immutably timestamped via a micro-transaction on the Monad Testnet, demonstrating the network's capacity for high-throughput, low-cost operations and creating a verifiable log of all analyses.

## ✨ Key Features

MonGPT is engineered with a specialized focus on the needs of the Web3 security and development community.

* **🧠 AI Smart Contract Auditor:** Submit Solidity code to receive a comprehensive analysis of potential vulnerabilities, security risks, gas optimization opportunities, and logical errors.
* **Decode Transaction & Security Analyst:** Provide a transaction hash to get a clear, human-readable explanation of its function, interacting contracts, and potential security flags.
* **Monad Ecosystem Expert:** Ask anything about the Monad blockchain, from its core architecture (parallel execution, MonadBFT) to its thriving ecosystem of dApps.

## 🚀 Core Concept: On-Chain Prompts

To showcase the power and efficiency of the Monad network, every interaction with MonGPT requires a minimal transaction on the Monad Testnet.

1.  **Connect Wallet:** Users connect their Web3 wallet.
2.  **Submit Prompt:** The user types their query.
3.  **Initiate Transaction:** A micro-transaction (e.g., 0.00001 MON) is sent to a burn address.
4.  **On-Chain Confirmation:** The dApp waits for the transaction to be confirmed on the Monad Testnet.
5.  **AI Analysis:** Upon confirmation, the prompt is securely sent to the AI backend for analysis.

This creates a permanent, on-chain record of every query, making MonGPT a truly Web3-native application.

## 🛠️ Tech Stack

MonGPT is built with a modern, robust, and scalable technology stack.

| Component         | Technology                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)      |
| **Blockchain** | ![Monad](https://img.shields.io/badge/Monad-9B51E0?style=for-the-badge&logo=ethereum&logoColor=white)          |
| **Wallet Connect**| ![RainbowKit](https://img.shields.io/badge/RainbowKit-0E76FD?style=for-the-badge&logo=rainbow&logoColor=white)|
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **AI Backend** | ![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B9?style=for-the-badge&logo=google&logoColor=white)    |
| **Deployment** | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)          |

## ⚙️ Getting Started: Local Development

To run a local instance of MonGPT, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/marksocrates1111/mongpt-dapp.git](https://github.com/marksocrates1111/mongpt-dapp.git)
    cd mongpt-dapp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add the following variables:
    ```env
    # Get this from Google AI Studio
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # Get this from WalletConnect Cloud
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="YOUR_WALLETCONNECT_PROJECT_ID"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/marksocrates1111/mongpt-dapp/issues).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/marksocrates1111/mongpt-dapp/blob/main/LICENSE) file for details.

---
<div align="center">
  <p>Created with passion by <a href="https://github.com/marksocrates1111">Mark Socrates</a></p>
</div>
