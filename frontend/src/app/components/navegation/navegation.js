"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import styles from "./navegation.module.css"
import authService from "../../../services/authService"
import { canAccessMenu } from "../../../utils/permissions"
import {
    FaHome,
    FaUserPlus,
    FaBoxes,
    FaHandHoldingHeart,
    FaUsers,
    FaChartBar,
    FaCog,
    FaUser,
    FaQuestionCircle,
    FaShoppingCart,
    FaAngleDoubleLeft,
    FaAngleDoubleRight,
    FaMapMarkerAlt,
    FaBullhorn,
    FaTimes
} from "react-icons/fa"

const STORAGE_KEY = "sanem_sidebar_condensed"

const entries = [
    { key: "home", path: "/home", label: "Home", icon: <FaHome />, group: "MENU" },
    { key: "stock", path: "/estoque", label: "Estoque", icon: <FaBoxes />, group: "MENU", tour: "nav-estoque" },
    { key: "donations", path: "/doacao/lista", label: "Doações", icon: <FaHandHoldingHeart />, group: "MENU", tour: "nav-doacoes" },
    { key: "demands", path: "/demandas", label: "Demandas", icon: <FaBullhorn />, group: "MENU", tour: "nav-demandas" },
    { key: "withdrawals", path: "/retirada", label: "Retirada", icon: <FaShoppingCart />, group: "MENU", tour: "nav-retirada" },
    { key: "donors", path: "/cadastrodoador/lista", label: "Doadores", icon: <FaHandHoldingHeart />, group: "MENU", tour: "nav-doadores" },
    { key: "beneficiaries", path: "/cadastrobeneficiario/lista", label: "Beneficiários", icon: <FaUsers />, group: "MENU", tour: "nav-beneficiarios" },
    { key: "collectionPoints", path: "/pontoscoleta/lista", label: "Pontos de Coleta", icon: <FaMapMarkerAlt />, group: "MENU" },
    { key: "reports", path: "/relatorios", label: "Relatórios", icon: <FaChartBar />, group: "OTHERS" },
    { key: "settings", path: "/configuracoes", label: "Configurações", icon: <FaCog />, group: "OTHERS" },
    { key: "users", path: "/usuarios", label: "Usuários", icon: <FaUser />, group: "OTHERS" },
    { key: "help", path: "/ajuda", label: "Ajuda", icon: <FaQuestionCircle />, group: "OTHERS", tour: "nav-ajuda" },
]

export default function Navigation() {
    const pathname = usePathname()
    const [isCondensed, setIsCondensed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [role, setRole] = useState("")

    const applySidebarDimensions = (condensed) => {
        if (typeof document === "undefined") return
        const isMobile = window.matchMedia("(max-width: 768px)").matches
        document.documentElement.style.setProperty("--sidebar-width", isMobile ? "0px" : (condensed ? "76px" : "220px"))
        document.documentElement.style.setProperty("--sidebar-offset", isMobile ? "0px" : (condensed ? "96px" : "250px"))
    }

    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY) === "true"
            setIsCondensed(saved)
            setRole(authService.getUser()?.role || "")
            applySidebarDimensions(saved)
        } catch {
            applySidebarDimensions(false)
        }

        const handleResize = () => applySidebarDimensions(isCondensed)
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [isCondensed])

    useEffect(() => {
        const toggleMobileMenu = () => setMobileOpen((current) => !current)
        window.addEventListener("sanem:toggle-navigation", toggleMobileMenu)
        return () => window.removeEventListener("sanem:toggle-navigation", toggleMobileMenu)
    }, [])

    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const toggleSidebar = () => {
        setIsCondensed((prev) => {
            const next = !prev
            try {
                localStorage.setItem(STORAGE_KEY, String(next))
            } catch {
                // O layout continua funcionando mesmo sem acesso ao armazenamento local.
            }
            applySidebarDimensions(next)
            return next
        })
    }

    const isActive = (path) => path === "/home"
        ? pathname === "/home"
        : pathname?.startsWith(path)

    const visibleEntries = entries.filter((entry) => canAccessMenu(role, entry.key))

    const renderEntry = (entry) => (
        <Link
            key={entry.key}
            href={entry.path}
            title={entry.label}
            data-tour={entry.tour}
            className={`${styles.menuItem} ${isActive(entry.path) ? styles.active : ""}`}
        >
            <span className={styles.menuIcon}>{entry.icon}</span>
            {!isCondensed && <span className={styles.menuLabel}>{entry.label}</span>}
        </Link>
    )

    return (
        <>
            <div
                className={`${styles.backdrop} ${mobileOpen ? styles.backdropVisible : ""}`}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />
            <aside className={`${styles.sidebar} ${isCondensed ? styles.condensed : ""} ${mobileOpen ? styles.mobileOpen : ""}`}
                aria-label="Navegação principal">
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoContainer}>
                        <Image
                            src="/logo-sanem.svg"
                            alt="Sanem"
                            width={isCondensed ? 42 : 76}
                            height={isCondensed ? 42 : 76}
                            className={styles.logoImage}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className={styles.mobileCloseBtn}
                        aria-label="Fechar menu"
                    >
                        <FaTimes />
                    </button>
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className={styles.toggleBtn}
                        title={isCondensed ? "Expandir menu" : "Condensar menu"}
                        aria-label={isCondensed ? "Expandir menu" : "Condensar menu"}
                        aria-expanded={!isCondensed}
                    >
                        {isCondensed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
                    </button>
                </div>
                <div className={styles.scrollArea}>
                    <div className={styles.sectionTitle}>{!isCondensed ? "MENU" : ""}</div>
                    <nav className={styles.menuSection} data-tour="nav-menu">
                        {visibleEntries.filter((entry) => entry.group === "MENU").map(renderEntry)}
                    </nav>

                    <div className={styles.sectionTitle}>{!isCondensed ? "OUTROS" : ""}</div>
                    <nav className={styles.menuSection}>
                        {visibleEntries.filter((entry) => entry.group === "OTHERS").map(renderEntry)}
                    </nav>
                </div>
                <div className={styles.sidebarFooter}>
                    <button
                        type="button"
                        onClick={toggleSidebar}
                        className={styles.collapseFooterBtn}
                        title={isCondensed ? "Expandir menu" : "Condensar menu"}
                    >
                        <span className={styles.menuIcon}>
                            {isCondensed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
                        </span>
                        {!isCondensed && <span className={styles.menuLabel}>Recolher menu</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}
