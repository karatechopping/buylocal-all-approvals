# Buy Local Social Media Post Approval

This is a web application built for Buy Local NZ to streamline their social media post approval process with their clients. It also includes a feature for approving "Featured Upgrades".

## Features

*   **Password Protection:** The application is protected by a password to ensure only authorized users can access it.
*   **Client Selection:** Users can select a client from a list to view their social media posts that are pending approval.
*   **Post Approval:** Users can approve, request a redo, or discard social media posts.
*   **Content Editing:** Users can edit the content of a post before approving it.
*   **Featured Upgrade Approvals:** A separate section for approving "Featured Upgrades".
*   **Airtable Integration:** The application is integrated with Airtable to fetch and update post information.
*   **Webhook Integration:** The application sends a webhook to a specified URL to trigger a workflow for creating social media posts.

## Tech Stack

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend:** Netlify Functions
*   **Database:** Airtable

## Getting Started

### Prerequisites

*   Node.js
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/karatechopping/buylocal-all-approvals.git
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Running Locally

You can run the project locally using one of the following commands:

*   `npm run dev`: This will start the Vite development server.
*   `npm run netlify:dev`: This will start the Netlify development server, which is useful for testing Netlify functions locally.
*   `npm run netlify:serve`: This will start the Netlify development server in offline mode.

## Deployment

This project is deployed on Netlify. The `netlify.toml` file specifies the build command and the publish directory.
