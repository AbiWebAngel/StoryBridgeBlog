"use client";

import Image from "next/image";
import React from "react";
import ImageSlider from "./components/ImageSlider";
import {useState, FormEvent } from 'react';
import NewsletterForm from "./components/NewsletterForm";


export default function HomePage() {
return (
    <main>
     {/* Newsletter */}
      <NewsletterForm />
    </main>
)
}