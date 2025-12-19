'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Trophy, Vote, TrendingUp, Shield, Zap, Users } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold text-gradient">Awards Voting</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 gradient-bg">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center animate-slide-up">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            Vote for <span className="text-gradient">Excellence</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            A modern, secure platform for awards voting with seamless payment integration.
                            Support your favorites and make your voice count.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/register">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                    Start Voting Now
                                </Button>
                            </Link>
                            <Link href="/voter/events">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                    Browse Events
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Vote, title: 'Easy Voting', desc: 'Simple and intuitive voting process' },
                            { icon: Shield, title: 'Secure Payments', desc: 'Multiple payment options integrated' },
                            { icon: TrendingUp, title: 'Real-time Results', desc: 'Live vote count updates' },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-6 shadow-lg hover-lift"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Built with cutting-edge technology to provide the best voting experience
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: 'Lightning Fast',
                                description: 'Optimized performance for quick loading and smooth interactions',
                            },
                            {
                                icon: Shield,
                                title: 'Secure & Safe',
                                description: 'Bank-level security with encrypted payment processing',
                            },
                            {
                                icon: Users,
                                title: 'User Friendly',
                                description: 'Intuitive interface designed for all users',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Real-time Analytics',
                                description: 'Track votes and results as they happen',
                            },
                            {
                                icon: Trophy,
                                title: 'Multiple Events',
                                description: 'Support for unlimited voting events and categories',
                            },
                            {
                                icon: Vote,
                                title: 'Unlimited Votes',
                                description: 'Vote multiple times for your favorite nominees',
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="bg-gradient-to-br from-primary-50 to-accent-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="h-7 w-7 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Make Your Voice Heard?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of voters supporting their favorite nominees
                    </p>
                    <Link href="/register">
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white text-primary-700 hover:bg-gray-100"
                        >
                            Create Free Account
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="h-6 w-6" />
                                <span className="font-bold text-lg">Awards Voting</span>
                            </div>
                            <p className="text-gray-400">
                                Professional awards voting platform with secure payment integration.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/voter/events" className="hover:text-white">Browse Events</Link></li>
                                <li><Link href="/login" className="hover:text-white">Login</Link></li>
                                <li><Link href="/register" className="hover:text-white">Register</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">For Organizers</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="/admin" className="hover:text-white">Admin Dashboard</Link></li>
                                <li><Link href="/admin/events" className="hover:text-white">Manage Events</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Help Center</a></li>
                                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 Awards Voting System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
