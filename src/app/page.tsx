"use client";

import React from "react";
import SearchComponent from "./components/home/SearchComponent";
import NewsletterForm from "./components/NewsletterForm";


export default function HomePage() {
return (
    <main>
      {/* Search Section */}
      <SearchComponent />
      

      {/* Newsletter */}
      <NewsletterForm />
    </main>
)
}