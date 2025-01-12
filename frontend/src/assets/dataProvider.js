import config from "@/config";


export const getDataGraphQL = async (query) => {
    try {
        const response = await fetch(config.graphqlUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify({ query }),
        });
        const { data, errors } = await response.json();
        if (errors) {
            return {error: errors[0]?.message || "An error occurred."};
        }
        else {
            return {response: data}
        }
    }
    catch (err) {
        return {error: err}
    }
}