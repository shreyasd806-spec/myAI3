import { tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";

// Define a type for the Exa search result that explicitly includes content (text)
// This is necessary because TypeScript's default type for search results sometimes omits 'text'.
interface ContentfulResult {
    title: string | null;
    url: string;
    publishedDate?: string;
    text: string; // Explicitly includes the text property
    // Include other Exa properties if needed
}

// Initialize Exa Client using the environment variable
const exa = new Exa(process.env.EXA_API_KEY);

export const getCurrentRatesTool = tool({
  description: 
    "Searches the live web for current and accurate financial rates, including APY/APR, loan rates, promotional offers, and product details (e.g., High-Yield Savings Accounts, CDs, Credit Cards) across top financial sources. MUST be used for any query involving numbers, rates, or current market data.",
  
  inputSchema: z.object({
    query: z.string().describe("The user's specific financial search query, e.g., 'highest APY on 1-year CDs' or 'current chase credit card offers'."),
    numResults: z.number().optional().describe("Maximum number of search results to fetch, defaults to 5."),
    domainFilter: z.string().optional().describe("A comma-separated list of high-authority financial domains to restrict the search to, e.g., 'bankrate.com, nerdwallet.com'"),
  }),
  
  execute: async ({ query, numResults = 5, domainFilter }) => {
    const domains = domainFilter ? domainFilter.split(',').map(d => d.trim()) : [];

    try {
      const searchOptions = {
        numResults: numResults,
        // Explicitly request contents and enable safe truncation.
        includeContents: { maxCharacters: 2500, autoTruncate: true }, 
        
        ...(domains.length > 0 && { domains: domains }),
      };

      const searchResponse = await exa.searchAndContents(query, searchOptions);
      
      if (!searchResponse.results || searchResponse.results.length === 0) {
        return "Search failed or returned no results for the specified query and filters.";
      }
      
      // 🔑 FINAL FIX: Convert the result array to unknown first before asserting the type.
      // This satisfies the strict TypeScript compiler regarding the lack of overlap.
      const resultsWithContent = searchResponse.results as unknown as ContentfulResult[];

      // Filter results to only include those where content (text) was successfully retrieved.
      // This is necessary for runtime safety, even with the type assertion.
      const contentfulResults = resultsWithContent.filter(result => result.text && result.text.trim().length > 0);

      if (contentfulResults.length === 0) {
          return "Search results were found, but the content could not be extracted from the source pages, preventing a factual response.";
      }
      
      // Format the results for the LLM to easily synthesize
      const structuredResults = contentfulResults.map(result => ({
        title: result.title,
        url: result.url,
        // 'result.text' is now guaranteed to exist by the filter and type assertion
        snippet: result.text.trim().slice(0, 500) + '...', 
        date: result.publishedDate,
      }));

      return {
        financial_product_results: structuredResults,
        metadata: { source_search_query: query },
      };
      
    } catch (error) {
      console.error("Exa Search Error:", error);
      return `An error occurred while fetching real-time data for: ${query}. Please ensure your EXA_API_KEY is correct.`;
    }
  },
});
