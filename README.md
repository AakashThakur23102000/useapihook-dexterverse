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
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | "PATCH";
    token: string | null;
    customHeaders: Record<string, string> | null;
    successCodeWithAction: Array<{ code: number; action: () => void }> | null;
    errorCodeWithAction: Array<{ code: number; action: () => void }> | null;
};
```
### *** Note on Custom Headers

If you're passing custom headers in the `customHeaders` field, **do not include the token** manually. The token will be added automatically by the hook when needed.

### Example:

```typescript
const customHeaders = {
  'Content-Type': 'application/json',
  // Do not add the 'Authorization' header manually. The hook will handle it automatically.
};
```

## 3. UseApiHook Context Integration

This project uses `UseApiHookContextStore` to manage API-related states and interactions seamlessly across the application. 
It can also be used to access some useful hooks inside `ApiFunctions.ts` normal function that was create in Step - 2.
<br/>Below is a guide to integrating and using this context.

### Setup

Integration in `index.js` or `app.tsx` where routes are handled.
<br/>
Wrap your app's NavigationContainer with the UseApiHookContextStore for context functionality. 
<br/><br/>
It can be then used in `apiCallingFunctionQuery` in the `ApiFunctions.ts`

```typescript
import UseApiHookContextStore from 'useapihook-dexterverse/context/UseApiHookContextStore';
```
```typescript
<NavigationContainer>
    <UseApiHookContextStore
        initialProp={{
          pageNotFoundFunc:()=>{navigation.navigate('PageNotFound')}
        }}
    >
        <Stack.Navigator initialRouteName="AppHome">
            <Stack.Screen name="AppHome" component={App} />
            <Stack.Screen name="DemoPage" component={DemoPage} />
            <Stack.Screen name="PageNotFound" component={PageNotFound} />
        </Stack.Navigator>
    </UseApiHookContextStore>
</NavigationContainer>
```



### *** Note on UseApiHook Context Integration
To ensure proper functionality of navigation in the application, please make sure to wrap `UseApiHookContextStore` inside either a `NavigationContainer` (for React Native) or a `BrowserRouter` (for React Web).
<br/><br/>
This ensures that navigation hooks such as `useNavigation` (React Native) or `useNavigate` (React Web) are properly integrated within your application as done in example above.

## 4. Use the API Hook in Your Component

After defining your API functions in `ApiFunctions.ts`, you can now use the `useApiHook` in your components to fetch data.

Below is an example of how to use the hook for making API calls in your component:

```typescript
//import useApiHook from your component and your api function.
import useApiHook from 'useapihook-dexterverse'

import { FIRST_API_FUNC, SECOND_API_FUNC } from './src/api/ApiFunctions';

const MyComponent = ({ navigation }: { navigation: any }) => {

  // First Example
  const {
    apiData: firstApiData,
    loadingState: firstApiLoading,
    refetchingApiFunction: firstRefetchFunction,
    apiError: firstApiError
  } = useApiHook({
    apiCallingFunction: FIRST_API_FUNC,
    apiCallingFunctionQuery: [{ navigation: navigation }],
    apiPayload: [{ name: "Aakash" }],
    runOnTimeOfScreenMount: true,
    initialLoadingState: true,
    apiCustomReturnFunction: (data: any) => {
      return data;
    },
    onErrorReturnFunction: (err: any) => {
      return err;
    },
  });

  // Second Example
  const {
    apiData: secondApiData,
    loadingState: secondApiLoading,
    refetchingApiFunction: secondRefetchFunction,
    apiError: secondApiError
  } = useApiHook({
    apiCallingFunction: SECOND_API_FUNC,
    apiCallingFunctionQuery: [{ navigation: navigation }],
    apiPayload: [{ demo: "Demo" }],
    runOnTimeOfScreenMount: false,
    initialLoadingState: true,
    apiCustomReturnFunction: (data: any) => {
      return data;
    },
    onErrorReturnFunction: (err: any) => {
      return err;
    },
  });

  // Render or handle the API response data
  if (firstApiLoading || secondApiLoading) {
    return <Text>Loading...</Text>;
  }

  if (firstApiError || secondApiError) {
    return <Text>Error: {firstApiError || secondApiError}</Text>;
  }

  return (
    <View>
      <Text>First API Response: {JSON.stringify(firstApiData)}</Text>
      <Text>Second API Response: {JSON.stringify(secondApiData)}</Text>
    </View>
  );
};

export default MyComponent;
```


## Explanation

| Prop Name                       | Description | Code Example |
|----------------------------------|-------------|--------------|
| `apiCallingFunction`             | The API function that will be called inside the hook. This function handles making the actual API request. Example: `FIRST_API_FUNC` or `SECOND_API_FUNC`. | `apiCallingFunction: FIRST_API_FUNC` |
| `apiCallingFunctionQuery`        | A list of query parameters or additional arguments passed to the `apiCallingFunction`. This can be used as a prop named apiCallingFunctionQuery in the Step 2.<br/> ***Note: The bracket is simply the field where you put your query object, so always wrap it in brackets. | `apiCallingFunctionQuery: [{ navigation: navigation }]` |
| `apiPayload`                     | The payload that will be sent with the API request. For example, `[{ name: "Aakash" }]` or `[{ demo: "Demo" }]`<br/> ***Note: The bracket is simply the field where you put your payload object, so always wrap it in brackets.  | `apiPayload: [{ name: "Aakash" }]` |
| `runOnTimeOfScreenMount`         | A boolean flag to specify if the API call should be triggered when the component mounts. If `true`, the API call is made on component mount. | `runOnTimeOfScreenMount: true` |
| `initialLoadingState`            | A boolean flag to indicate the initial state of the API call. If `true`, it shows the loading indicator when the hook is initialized. | `initialLoadingState: true` |
| `apiCustomReturnFunction`        | A custom function to handle the successful API response data. It allows you to modify or process the response before it's returned.  | `apiCustomReturnFunction: (data: any) => { return data; }` |
| `onErrorReturnFunction`          | A custom function to handle errors. This function will be called if the API request fails. | `onErrorReturnFunction: (err: any) => { return err; }` |
| `apiData`                        | The response data from the API call, which is returned once the API request is successful.<br/>***Note - These can be renamed accordingly. | `apiData: firstApiData` |
| `loadingState`                   | A boolean indicating whether the API call is still loading or not.<br/>***Note - These can be renamed accordingly.| `loadingState: firstApiLoading` |
| `refetchingApiFunction`          | A function that can be used to re-trigger the API call, usually in case of failure or to refresh or recall the api.<br/>***Note - These can be renamed accordingly.  | `refetchingApiFunction: firstRefetchFunction` |
| `apiError`                       | Stores the error returned from the API request, if any.<br/>***Note - These can be renamed accordingly. | `apiError: firstApiError` |
| `type`                           | An optional prop that specifies the type of request. It can either be `"API"` (default) for a standard API call or `"FORMDATA"` for handling form data requests. <br/>*But do not use this prop as it is still under working. | `type: "API"` |


## 5. Refetching the API

To refetch the API, use the `refetchingApiFunction` provided by the hook. This function allows you to re-trigger the API call when necessary or when runOnTimeOfScreenMount is false. You can call this function with or without conditional arguments.

***Note***: The order of arguments is important — `loadingState`, `[payload]`, `customReturnFunction`, and `customErrorFunction`.

### Example:

In this step, we'll create a button that triggers the API refetch when pressed.

```tsx
<Button
  title="Refetch API"
  onPress={async () => {

    // Trigger the API refetch
    await refetchFunction(
      true,                    // First parameter: Set to `true` or `false` to control the loading state.
      [{ payload: "payload" }], // Second parameter: Provide any payload to be sent with the API request.
      (data: any) => {         // Third parameter: Success callback to handle the response.
        return data;           
      },
      (err: any) => {          // Fourth parameter: Error callback to handle any failure.
        return err;            
      }
    );

  }}
/>
```

```tsx
<Button
  title="Refetch API"
  onPress={async () => {

    // Trigger the API refetch
    await refetchFunction();

  }}
/>
```

## Authors

- [@AakashThakur23102000](https://github.com/AakashThakur23102000)

## 🚀 About Me
I'm a react native developer.


## Feedback

If you have any feedback, please mail at aakashthakur20001972@gmail.com.
