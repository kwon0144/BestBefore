'use client';
import Hero from './(components)/home/Hero';
import ProblemStatement from './(components)/home/ProblemStatement';
import Solution from './(components)/home/Solution';

export default function Home() {
  return (
    <div>
      <Hero />
      <ProblemStatement />
      <Solution />
    </div>
  );
}
