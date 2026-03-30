import axios from "axios";

// Using relative path for production and local compatibility
const LOCAL_BASE_URL = "/api/hadith/";

const localApiClient = axios.create({
  baseURL: LOCAL_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getHadiths = async (slug) => {
  // slug example: "sahih-muslim/chapters" or just "sahih-muslim"
  const isChapterRequest = slug.includes('/chapters');
  const bookName = slug.split('/')[0]; 

  // Direct the request to the correct endpoint
  const endpoint = isChapterRequest ? "get-chapters/" : "get-hadith/";

  const response = await localApiClient.get(endpoint, {
    params: { book: bookName },
  });

  return response.data;
};

export const fetchHadith = async (endpoint, params = {}) => {
  const response = await axios.get(
    `https://hadithapi.com/api/${endpoint}`,
    {
      params: {
        ...params,
        apiKey: "$2y$10$d4nL2E660zHHBrwTB7Bviu3WvW5sToLRBWFbJ1yhn7rJzSuNpA0S",
      },
    }
  );
  return response.data;
};

export default localApiClient;