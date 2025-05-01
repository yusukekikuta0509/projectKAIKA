// src/components/Logo.tsx
'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export const Logo = ({ width: propWidth, height: propHeight }: { width?: number | string, height?: number | string }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth - 0.5);
            mouseY.set(e.clientY / window.innerHeight - 0.5);
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [mouseX, mouseY]);

    const offsetX = useTransform(smoothMouseX, [-0.5, 0.5], [-20, 20]);
    const offsetY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);
    const waveOffsetX = useTransform(smoothMouseX, [-0.5, 0.5], [15, -15]);

    // Extended wave path
    const wavePathBase = "M-100 220 C50 180 300 260 450 220 C600 190 700 250 900 220 L900 250 L-100 250 Z";
    const wavePathVariant1 = "M-100 220 C50 190 300 250 450 230 C600 200 700 240 900 220 L900 250 L-100 250 Z";
    const wavePathVariant2 = "M-100 220 C50 170 300 270 450 210 C600 180 700 260 900 220 L900 250 L-100 250 Z";

    const gradientId = "kaika-grad-static";

    const textVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 1.0 } }
    };

    const waveVariants = {
        hidden: { opacity: 0, x: "-100%", scaleX: 1 },
        slideIn: { opacity: 1, x: "0%", scaleX: 1, transition: { duration: 1.5, ease: "easeOut" } },
        expandPlaceholder: { transition: { duration: 0.1 } }, // No actual animation here
        finalWiggle: { d: [wavePathBase, wavePathVariant1, wavePathVariant2, wavePathBase], transition: { duration: 5, ease: "easeInOut", repeat: Infinity } }
    };

    // Calculate width/height based on props or default aspect ratio
    const viewBoxWidth = 800;
    const viewBoxHeight = 250;
    const aspectRatio = viewBoxWidth / viewBoxHeight;

    let width: number | string | undefined = propWidth;
    let height: number | string | undefined = propHeight;

    if (width && !height) {
        height = typeof width === 'number' ? width / aspectRatio : 'auto';
    } else if (!width && height) {
        width = typeof height === 'number' ? height * aspectRatio : 'auto';
    } else if (!width && !height) {
        // Default size if none provided
        width = 250;
        height = width / aspectRatio;
    }


    return (
        <motion.svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            width={width} // Use calculated or provided width
            height={height} // Use calculated or provided height
            xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: 'default', overflow: 'visible', display: 'block' }}
            // preserveAspectRatio defaults to xMidYMid meet (correct for non-stretching)
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF8C00" />
                    <stop offset="100%" stopColor="#FFC870" />
                </linearGradient>
            </defs>

            {/* Text */}
            <motion.g
                fill={`url(#${gradientId})`}
                style={{ x: offsetX, y: offsetY }}
                variants={textVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.g
                    animate={{ skewY: [0, 1.5, -1.5, 0] }}
                    transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 1.8 }}
                >
                    <path // Text path data
                        d="M0.454546 70V0.181816H8.90909V34.8182H9.72727L41.0909 0.181816H52.1364L22.8182 31.6818L52.1364 70H41.9091L17.6364 37.5455L8.90909 47.3636V70H0.454546ZM65.9432 70H57.0795L82.7159 0.181816H91.4432L117.08 70H108.216L87.3523 11.2273H86.8068L65.9432 70ZM69.2159 42.7273H104.943V50.2273H69.2159V42.7273ZM136.409 0.181816V70H127.955V0.181816H136.409ZM153.361 70V0.181816H161.815V34.8182H162.634L193.997 0.181816H205.043L175.724 31.6818L205.043 70H194.815L170.543 37.5455L161.815 47.3636V70H153.361ZM218.849 70H209.986L235.622 0.181816H244.349L269.986 70H261.122L240.259 11.2273H239.713L218.849 70ZM222.122 42.7273H257.849V50.2273H222.122V42.7273Z"
                        transform="translate(100 50) scale(2.5)"
                    />
                </motion.g>
            </motion.g>

            {/* Wave */}
            <motion.path
                fill={`url(#${gradientId})`}
                style={{ x: waveOffsetX }}
                variants={waveVariants}
                initial="hidden"
                animate={["slideIn", "expandPlaceholder", "finalWiggle"]}
            />
        </motion.svg>
    );
};