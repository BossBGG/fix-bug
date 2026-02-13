# 📦 Frontend Runtime Environment Configuration

This project demonstrates two approaches for injecting runtime environment variables into a frontend (e.g., Next.js) application deployed in Kubernetes:

1. **Using `entrypoint.sh` and `env-config.js`**
2. **Using the [`next-runtime-env`](https://www.npmjs.com/package/next-runtime-env) library**

---

## 🛠️ Approach 1: `entrypoint.sh` + `env-config.js`

### 🧩 Overview

This method writes environment variables into a JavaScript file (`env-config.js`) during container startup. The frontend reads this file at runtime.

### 📁 Folder Structure

/entrypoint.sh # Startup script

/public/env/env-config.js # Generated at runtime


### 🔧 1. Create `entrypoint.sh`

```bash
#!/bin/bash

# Define the path to generate the env-config.js file
ENV_FILE=/app/public/env/env-config.js

# Output environment variables prefixed with NEXT_PUBLIC_
echo "Generating runtime environment variables for the browser..."
echo "window.__ENV__ = {" > $ENV_FILE
env | grep '^NEXT_PUBLIC_CLIENT' | sed -E 's/([^=]*)=(.*)/"\1": "\2",/' >> $ENV_FILE
echo "};" >> $ENV_FILE

# Log the generated file
echo "Generated $ENV_FILE:"
cat $ENV_FILE

# Start the Next.js application
exec node_modules/.bin/next start
```
### 🔧 2. Create `env-config.js`

```javascript
// /public/env/env-config.js
// This file is generated at runtime by entrypoint.sh
window.__ENV__ = {
  NEXT_PUBLIC_CLIENT_ID: "your-client-id",
  NEXT_PUBLIC_API_URL: "https://api.example.com"
};
```

### 🔧 3. Update following line to `Dockerfile`

```dockerfile
# Dockerfile

COPY --chown=65532:65532 --from=builder /app/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
```

### 🔧 4. Add script to the global `layout.tsx`

```javascript
// /app/layout.tsx (Global layout file)
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script id="env-config" src="/env/env-config.js" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

## How to use the environment variables in your Next.js app

You can access the injected environment variables in your Next.js app using `window.__ENV__` or `window._env_` (depending on the approach you choose).

For example:

```javascript
// Accessing the environment variables
const apiUrl = window.__ENV__.NEXT_PUBLIC_API_URL;
const clientId = window.__ENV__.NEXT_PUBLIC_CLIENT_ID;
console.log('API URL:', apiUrl);
console.log('Client ID:', clientId);
```

---

## 🧪 Approach 2: `next-runtime-env` Library

### 🧩 Overview

This method uses the [`next-runtime-env`](https://www.npmjs.com/package/next-runtime-env) library to inject environment variables at runtime.

### 📦 1. Install the package

```bash
npm install next-runtime-env
```

Two ways of using this library:
1. **Using `import { PublicEnvScript } from "next-runtime-env";`**

Its look similar to the `entrypoint.sh` method, but it uses the `next-runtime-env` library to generate the `window.__ENV__`. [[example](https://github.com/expatfile/next-runtime-env/tree/development/examples/with-app-router-script)]

```javascript
// /app/layout.tsx (Global layout file)
import { PublicEnvScript } from 'next-runtime-env';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

```javascript
/*  /app/page.tsx (Page file)
*   Only for client side
*/
'use client';
import { env } from 'next-runtime-env';

export default function Page() {
  return (
    <div>
      <h1>Environment Variables</h1>
      <p>Client ID: {env('NEXT_PUBLIC_CLIENT_ID')}</p>
      <p>API URL: {env('NEXT_PUBLIC_API_URL')}</p>
    </div>
  );
}
```

2. **Using `import { PublicEnvProvider } from 'next-runtime-env';`**

Its use context API to inject the environment variables into the React context. [[example](https://github.com/expatfile/next-runtime-env/tree/development/examples/with-app-router-context)]

```javascript
// /app/layout.tsx (Global layout file)
import { PublicEnvProvider } from 'next-runtime-env';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PublicEnvProvider>{children}</PublicEnvProvider>
      </body>
    </html>
  );
}
```

```javascript
/*  /app/page.tsx (Page file)
*   Only for client side
*/
'use client';

import { useEnvContext } from 'next-runtime-env';

export default function Page() {
  const { NEXT_PUBLIC_CLIENT_ID, NEXT_PUBLIC_API_URL } = useEnvContext();

  return (
    <div>
      <h1>Environment Variables</h1>
      <p>Client ID: {NEXT_PUBLIC_CLIENT_ID}</p>
      <p>API URL: {NEXT_PUBLIC_API_URL}</p>
    </div>
  );
}
```