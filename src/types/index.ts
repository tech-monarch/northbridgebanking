import type { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Testimonial {
  name: string;
  initials: string;
  stars: number;
  text: string;
  color: string;
}

export interface Step {
  num: number;
  title: string;
  desc: string;
  icon: ReactNode;
}

export interface Feature {
  title: string;
  icon: ReactNode;
}

export interface Reason {
  title: string;
  desc: string;
  icon: ReactNode;
}

export interface FaqItem {
  question: string;
  answer: string;
}
