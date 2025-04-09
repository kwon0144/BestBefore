'use client';
import Articles from './food-network/(components)/home/Articles';
import Hero from './food-network/(components)/home/Hero';
import ProblemStatement from './food-network/(components)/home/ProblemStatement';
import Solution from './food-network/(components)/home/Solution';

export default function Home() {
  return (
    <div>
      <Hero />
      <ProblemStatement />
      <Solution />
      <Articles />
    </div>
  );
}
