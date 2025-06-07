"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import React from "react";

const Home = () => {
  const [theme, setTheme] = useTheme();

  return (
    <div>
      <Button
        className="bg-primary text-accent"
        onClick={() => setTheme(theme == "Ocean" ? "Neon" : "Ocean")}
      >
        Switch Themes
      </Button>
    </div>
  );
};

export default Home;
