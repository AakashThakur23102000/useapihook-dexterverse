import { useState, useEffect, useContext } from 'react';
import { UseApiHookContext } from '../context/UseApiHookProvider';
import { useApiHookThrottler } from "../utils/useApiHookThrottler"

// Parameter interface 
interface useApiHookInterface {
    apiCallingFunction: Function,
    apiQuery?: any[],
    type?: "API" | "FORMDATA",
    apiPayload: any[],
    apiCustomReturnFunction: Function,
    onErrorReturnFunction: Function,
    runOnTimeOfScreenMount: boolean,
    initialLoadingState: boolean,
    throttleTime?: number[] | null,
}

interface useApiHookInterfaceRefetch {
    refetchInitialLoadingState?: boolean,
    refetchApiPayload?: any[],
    refetchApiQuery?: any[],
    refetchApiCustomReturnFunction?: Function | null,
    refetchOnErrorReturnFunction?: Function | null
}


export const useApiHook = ({
    apiCallingFunction,
    type = "API",
    apiQuery = [],
    apiPayload = [],
    runOnTimeOfScreenMount,
    initialLoadingState,
    throttleTime = null,
    apiCustomReturnFunction,
    onErrorReturnFunction,
}: useApiHookInterface) => {

    // context
    const UseApiHookContextData = useContext(UseApiHookContext) || null;

    // Loading state as a useState hook to trigger re-renders
    const [loadingState, setLoadingState] = useState(false);
    const [apiData, setApiData] = useState<null | any>(null);
    const [apiError, setApiError] = useState<null | any[] | string | Error>(null);


    //some static values
    const fetchHeaders = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };

    const fetchHeadersForFormData = {
        Accept: 'application/json',
        "Content-Type": "multipart/form-data"
    };


    // Function to call the API
    const apiFetching = async (
        refetchApiPayload?: any[],
        refetchApiQuery?: any[],
        refetchApiCustomReturnFunction?: Function | null,
        refetchOnErrorReturnFunction?: Function | null
    ) => {
        if (type === "API") {
            try {
                const queryToUse = refetchApiQuery?.[0] || apiQuery?.[0];
                if (queryToUse) {
                    queryToUse["contextData"] = UseApiHookContextData;
                }
                var apiCallingFunctionObj = await apiCallingFunction(queryToUse || { contextData: UseApiHookContextData });

                var apiFetchingOptionsObj: any = {};
                apiFetchingOptionsObj["method"] = apiCallingFunctionObj.method
                apiFetchingOptionsObj["headers"] = apiCallingFunctionObj.customHeaders ?
                    apiCallingFunctionObj.customHeaders :
                    fetchHeaders;
                if (apiCallingFunctionObj.token) {
                    apiFetchingOptionsObj["headers"]["Authorization"] = apiCallingFunctionObj.token;
                }
                if ((apiCallingFunctionObj.method !== "GET") && (apiCallingFunctionObj.method !== "DELETE")) {
                    apiFetchingOptionsObj["body"] = JSON.stringify(
                        refetchApiPayload?.[0] || apiPayload?.[0] || {}
                    )
                }

                // main api calling is done here using fetch
                var apiResponseWithoutConverted = await fetch(apiCallingFunctionObj.fullUrl, apiFetchingOptionsObj)
                var apiResponseAfterConverted = await apiResponseWithoutConverted.json();

                if (apiResponseWithoutConverted.ok) {
                    var finalResult;

                    if (refetchApiCustomReturnFunction) {
                        finalResult = await refetchApiCustomReturnFunction(apiResponseAfterConverted);
                    } else {
                        finalResult = await apiCustomReturnFunction(apiResponseAfterConverted);
                    }
                    if (apiCallingFunctionObj.successCodeWithAction) {
                        for (const item of apiCallingFunctionObj.successCodeWithAction) {
                            if (apiResponseWithoutConverted.status === item.code) {
                                await item.action();
                            }
                        };
                    }
                    setApiData(finalResult); // Set the API data on success
                    setApiError(null);       // Clear any previous error
                } else {
                    var finalError;
                    if (refetchOnErrorReturnFunction) {
                        finalError = await refetchOnErrorReturnFunction(apiResponseAfterConverted);
                    } else {
                        finalError = await onErrorReturnFunction(apiResponseAfterConverted);
                    }

                    if (apiCallingFunctionObj.errorCodeWithAction) {
                        for (const item of apiCallingFunctionObj.errorCodeWithAction) {
                            if (apiResponseWithoutConverted.status === item.code) {
                                await item.action();
                            }
                        };
                    }
                    setApiError(finalError);
                    setApiData(null);

                }
                setApiData(finalResult);

            } catch (error: any) {
                var finalError;
                if (refetchOnErrorReturnFunction) {
                    finalError = await refetchOnErrorReturnFunction(error);
                } else {
                    finalError = await onErrorReturnFunction(error);
                }
                setApiError(finalError)
            }


            finally {
                setLoadingState((prevState) => {
                    if (prevState !== false) {
                        return false;
                    }
                    return prevState;
                });
            }

        } else {
            try {
                if (apiQuery?.[0]) {
                    var apiCallingFunctionQueryOld = apiQuery[0]
                    apiCallingFunctionQueryOld["contextData"] = UseApiHookContextData;
                }
                var apiCallingFunctionObj = await apiCallingFunction(apiCallingFunctionQueryOld || { contextData: UseApiHookContextData });

                var apiFetchingOptionsObj: any = {};
                apiFetchingOptionsObj["method"] = apiCallingFunctionObj.method
                apiFetchingOptionsObj["headers"] = apiCallingFunctionObj.customHeaders ?
                    apiCallingFunctionObj.customHeaders :
                    fetchHeadersForFormData;
                if (apiCallingFunctionObj.token) {
                    apiFetchingOptionsObj["headers"]["Authorization"] = apiCallingFunctionObj.token;
                }
                if ((apiCallingFunctionObj.method !== "GET") && (apiCallingFunctionObj.method !== "DELETE")) {
                    var dataArray = refetchApiPayload?.[0] || apiPayload?.[0] || {}
                    const formData = new FormData();
                    for (const key in dataArray) {
                        if (Array.isArray(dataArray[key])) {
                            dataArray[key].forEach((item: any) => {
                                if (item.uri) {
                                    const file = {
                                        uri: item.uri,
                                        type: item.type || 'application/octet-stream',
                                        name: item.name || 'file',
                                    };
                                    formData.append(key, file as any);
                                } else {
                                    // If it's a plain object, you can JSON-stringify or handle it differently
                                    formData.append(key, JSON.stringify(item));
                                }
                            });
                        } else {
                            formData.append(key, dataArray[key]);
                        }
                    }
                    // adding it to header
                    apiFetchingOptionsObj["body"] = formData;
                }

                // main api calling is done here using fetch
                var apiResponseWithoutConverted = await fetch(apiCallingFunctionObj.fullUrl, apiFetchingOptionsObj)
                var apiResponseAfterConverted = await apiResponseWithoutConverted.json();

                if (apiResponseWithoutConverted.ok) {
                    var finalResult;

                    if (refetchApiCustomReturnFunction) {
                        finalResult = await refetchApiCustomReturnFunction(apiResponseAfterConverted);
                    } else {
                        finalResult = await apiCustomReturnFunction(apiResponseAfterConverted);
                    }
                    if (apiCallingFunctionObj.successCodeWithAction) {
                        for (const item of apiCallingFunctionObj.successCodeWithAction) {
                            if (apiResponseWithoutConverted.status === item.code) {
                                await item.action();
                            }
                        };
                    }
                    setApiData(finalResult); // Set the API data on success
                    setApiError(null);       // Clear any previous error
                } else {
                    var finalError;
                    if (refetchOnErrorReturnFunction) {
                        finalError = await refetchOnErrorReturnFunction(apiResponseAfterConverted);
                    } else {
                        finalError = await onErrorReturnFunction(apiResponseAfterConverted);
                    }

                    if (apiCallingFunctionObj.errorCodeWithAction) {
                        for (const item of apiCallingFunctionObj.errorCodeWithAction) {
                            if (apiResponseWithoutConverted.status === item.code) {
                                await item.action();
                            }
                        };
                    }
                    setApiError(finalError);
                    setApiData(null);

                }
                setApiData(finalResult);

            } catch (error: any) {
                var finalError;
                if (refetchOnErrorReturnFunction) {
                    finalError = await refetchOnErrorReturnFunction(error);
                } else {
                    finalError = await onErrorReturnFunction(error);
                }
                setApiError(finalError)
            }


            finally {
                setLoadingState((prevState) => {
                    if (prevState !== false) {
                        return false;
                    }
                    return prevState;
                });
            }
        }

    };

    const useRefetchingApiFunction = async (
        {
            refetchInitialLoadingState = initialLoadingState,
            refetchApiPayload = apiPayload,
            refetchApiQuery = apiQuery,
            refetchApiCustomReturnFunction = apiCustomReturnFunction,
            refetchOnErrorReturnFunction = onErrorReturnFunction
        }: useApiHookInterfaceRefetch = {}
    ) => {
        const isThrottled = useApiHookThrottler(
            apiCallingFunction.name,
            throttleTime !== null ? (throttleTime[0] ? throttleTime[0] : null) : null
        );
        if (!isThrottled) {
            if (refetchInitialLoadingState !== undefined) {
                if (refetchInitialLoadingState !== loadingState) {
                    setLoadingState(refetchInitialLoadingState);
                }
            } else {
                if (initialLoadingState !== loadingState) {
                    setLoadingState(initialLoadingState);
                }
            }

            await apiFetching(refetchApiPayload, refetchApiQuery, refetchApiCustomReturnFunction, refetchOnErrorReturnFunction);
        }
    }


    // Run the API call when the component mounts, if specified
    useEffect(() => {
        if (runOnTimeOfScreenMount) {
            if (initialLoadingState !== loadingState) {
                setLoadingState(initialLoadingState);
            }
            apiFetching();
        }
    }, []);


    //  final return 
    return { loadingState, apiData, apiError, useRefetchingApiFunction };
};

export default useApiHook;
