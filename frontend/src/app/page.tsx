'use client';
import Articles from './(components)/Home/Articles';
import Hero from './(components)/Home/Hero';
import ProblemStatement from './(components)/Home/ProblemStatement';
import Solution from './(components)/Home/Solution';

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
