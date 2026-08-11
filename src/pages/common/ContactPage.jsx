import React from 'react';
import Navbar from '../../components/common/Navbar';
import ContactSection from '../../components/common/ContactSection';
import Footer from '../../components/common/Footer';

export default function ContactPage({ onOpenCart }) {
    return (
        <div>
            <Navbar onOpenCart={onOpenCart} />
            <ContactSection />
            <Footer />
        </div>
    );
}