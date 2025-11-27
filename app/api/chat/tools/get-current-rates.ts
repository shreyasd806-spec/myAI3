import { tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";

// Initialize Exa Client using the environment variable
// This will securely use the EXA_API_KEY set in Vercel.
const exa = new Exa(process.env.EXA_API_KEY);

/**
 * Tool for searching the live web for current financial rates and offers.
 * This is crucial for RateMind's real-time accuracy.
 */
export const getCurrentRatesTool = tool({
  // This description MUST be highly explicit so the LLM knows when to call it.
  description: 
    "Searches the live web for current and accurate financial rates, including APY/APR, loan rates, promotional offers, and product details (e.g., High-Yield Savings Accounts, CDs, Credit Cards) across top financial sources. MUST be used for any query involving numbers, rates, or current market data.",
  
  // Define the structured input the LLM must provide (inputSchema)
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
        // Set a high character limit so the LLM gets enough context from the financial articles
        includeContents: { maxCharacters: 2500 }, 
        ...(domains.length > 0 && { domains: domains }),
      };

      // Perform the search
      const { results } = await exa.searchAndContents(query, searchOptions);

      if (!results || results.length === 0) {
        return "Search failed or returned no results for the specified query and filters.";
      }

      // Format the results for the LLM to easily synthesize
      const structuredResults = results.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.text.trim().slice(0, 500) + '...',
        date: result.publishedDate,
      }));

      return {
        financial_product_results: structuredResults,
        metadata: { source_search_query: query },
      };
      
    } catch (error) {
      console.error("Exa Search Error:", error);
      return `An error occurred while fetching real-time data for: ${query}. Please ensure the EXA_API_KEY is correct.`;
    }
  },
});
