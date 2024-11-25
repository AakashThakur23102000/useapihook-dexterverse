
# Installation

To install and set up the library, run:

```bash
  npm i useapihook-dexterverse
```
    
# Purpose

`useApiHook` is a custom React/React Native hook for handling API requests with configurable actions based on success or error response codes. It manages the loading state, response data, and error states while allowing you to customize the API logic.

# Steps to Set Up in Your Project

## 1. Create a new file for all API functions in the project.

In this file, all the project APIs will be handled. Do not call the API in other files, as the purpose of this hook is to centralize API calls in one place.

Create a file `ApiFunctions.ts` and add your API functions as shown below.

## 2. Define Your API Functions in `ApiFunctions.ts`

In the `ApiFunctions.ts` file, define all your API functions. Below is an example of how to structure an API function:

```typescript
var mainURL = "any base url"

export const FIRST_API_FUNC = async (apiCallingFunctionQuery: any) => {
    return {
        fullUrl: mainURL+"furtherUrl",
        method: 'GET',
        token: null,
        customHeaders: null,
        successCodeWithAction: null,
        errorCodeWithAction: null
    };
};

export const SECOND_API_FUNC = async (apiCallingFunctionQuery: any) => {
    return {
        fullUrl: mainURL+"furtherUrl",
        method: 'POST',
        token: "Bearer any token",
        customHeaders: { 'Content-Type': 'application/json' },
        successCodeWithAction: [{
            code: 200,
            action: () => {
                console.log("Api hit successfully.")
                apiCallingFunctionQuery.navigation.navigate("DemoPage")
            }
        }],
        errorCodeWithAction: [{
            code: 400,
            action: () => {
                console.log("Status code is 400.")
            },
        }]
    };
};
```

```typescript 
// Type for API response configuration
type ApiFunctionTypes = {
    fullUrl: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    token: string | null;
    customHeaders: Record<string, string> | null;
    successCodeWithAction: Array<{ code: number; action: () => void }> | null;
    errorCodeWithAction: Array<{ code: number; action: () => void }> | null;
};
````
## *** Note on Custom Headers

If you're passing custom headers in the `customHeaders` field, **do not include the token** manually. The token will be added automatically by the hook when needed.

### Example:

```typescript
const customHeaders = {
  'Content-Type': 'application/json',
  // Do not add the 'Authorization' header manually. The hook will handle it automatically.
};
