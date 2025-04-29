'use client';
import Articles from '@/app/(components)/Home/Articles';
import Hero from '@/app/(components)/Home/Hero';
import ProblemStatement from '@/app/(components)/Home/ProblemStatement';
import Solution from '@/app/(components)/Home/Solution';

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
