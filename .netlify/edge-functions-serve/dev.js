import { boot } from "https://65437779a0c9990008b54abe--edge.netlify.com/bootstrap/index-combined.ts";

const functions = {}; const metadata = { functions: {} };


      try {
        const { default: func } = await import("file:///Users/paulscanlon/Documents/Paulie/Dev%20Live/wayback/development/wayback/.netlify/edge-functions/server.js");

        if (typeof func === "function") {
          functions["server"] = func;
          metadata.functions["server"] = {"url":"file:///Users/paulscanlon/Documents/Paulie/Dev%20Live/wayback/development/wayback/.netlify/edge-functions/server.js"}
        } else {
          console.log("\u001b[91m◈\u001b[39m \u001b[31mFailed\u001b[39m to load Edge Function \u001b[33mserver\u001b[39m. The file does not seem to have a function as the default export.");
        }
      } catch (error) {
        console.log("\u001b[91m◈\u001b[39m \u001b[31mFailed\u001b[39m to run Edge Function \u001b[33mserver\u001b[39m:");
        console.error(error);
      }
      

boot(functions, metadata);