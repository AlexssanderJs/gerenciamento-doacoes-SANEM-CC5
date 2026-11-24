"use client"
import React, { useState, useEffect, useRef } from "react"
import MenuBar from "../../components/menubar/menubar"
import Navigation from "../../components/navegation/navegation"
import styles from "./lista.module.css"
import apiService from "../../../services/api"
import { useNotification } from "../../../components/notifications/NotificationProvider"
import { FaPlus, FaTrash, FaMinus, FaChevronDown, FaTimes, FaFilter } from "react-icons/fa"
import ConfirmationModal from "../../../components/confirmation/ConfirmationModal"
import {
    mapDonorFromBackend,
    mapItemFromBackend,
    mapDonationFromBackend
} from "../../../services/dataMapper"
import authService from "../../../services/authService"
import NewItemModal from "../../../components/items/NewItemModal"
import { normalizeRole } from "../../../utils/permissions"

export default function ListaDoacoesPage() {
    const { showNotification } = useNotification()
    useEffect(() => { setIsAdmin(normalizeRole(authService.getUser()?.role) === "ADMINISTRATOR") }, [])
    const [isAdmin, setIsAdmin] = useState(false)

    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(true)
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        action: null,
        message: "",
        title: ""
    })

    // Modais e estados de Adição
    const [showAddModal, setShowAddModal] = useState(false)
    const [donors, setDonors] = useState([])
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])
    const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0, size: 50 })
    const [selectedDonor, setSelectedDonor] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [searchDonor, setSearchDonor] = useState("")
    const [searchItem, setSearchItem] = useState("")
    const [showDonorDropdown, setShowDonorDropdown] = useState(false)
    const [showItemDropdown, setShowItemDropdown] = useState(false)
    const [newItemName, setNewItemName] = useState("")
    const [showNewItemModal, setShowNewItemModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // ==========================================
    // LÓGICA DE FILTROS APRIMORADA
    // ==========================================

    // 'filters' guarda os valores que realmente vão para o backend
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        donorName: "",
        attendantName: "",
        itemName: ""
    })

    // 'inputValues' guarda o que o usuário está digitando na tela
    const [inputValues, setInputValues] = useState({
        donorName: "",
        attendantName: "",
        itemName: ""
    })
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

    const [activeDropdown, setActiveDropdown] = useState(null)
    const [filterOptions, setFilterOptions] = useState({
        donors: [],
        attendants: [],
        items: []
    })

    const dropdownRef = useRef(null)

    // Detecta cliques fora dos dropdowns para fechá-los de forma limpa
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdown(null)
                // Se o usuário digitou algo mas não selecionou, reverte o texto para o filtro atual
                setInputValues({
                    donorName: filters.donorName,
                    attendantName: filters.attendantName,
                    itemName: filters.itemName
                })
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [filters])

    // Carrega as opções dos selects ao montar a tela
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const [dData, attendants, iData, cData] = await Promise.all([
                    apiService.getDonors(),
                    apiService.getDonationAttendants(),
                    apiService.getItems(),
                    apiService.getCategories()
                ])
                setCategories((cData || []).filter((category) => !category.deletedAt))
                setFilterOptions({
                    donors: (dData || []).map(d => d.name || d.nomeCompleto).filter(Boolean),
                    attendants: (attendants || []).filter(Boolean),
                    items: (iData || []).map(i => i.description || i.nome).filter(Boolean)
                })
            } catch (err) {
                console.error("Erro ao carregar opções de filtro", err)
            }
        }
        fetchFilterOptions()
    }, [])

    // Carrega os dados reais sempre que o objeto de filtros oficiais mudar
    useEffect(() => {
        loadDonations(filters)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.startDate, filters.endDate, filters.donorName, filters.attendantName, filters.itemName])

    const handleDateChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    // Lida apenas com a digitação (não faz requisição)
    const handleTextTyping = (field, value) => {
        setInputValues(prev => ({ ...prev, [field]: value }))
        setActiveDropdown(field)

        // Se o usuário apagar tudo manualmente, nós limpamos o filtro oficial também
        if (value.trim() === "") {
            setFilters(prev => ({ ...prev, [field]: "" }))
        }
    }

    // Lida com a seleção de uma opção na lista (Faz a requisição)
    const handleOptionSelect = (field, value) => {
        setInputValues(prev => ({ ...prev, [field]: value })) // Preenche o input
        setFilters(prev => ({ ...prev, [field]: value })) // Atualiza o filtro oficial
        setActiveDropdown(null) // Fecha o dropdown
    }

    const clearFilters = () => {
        setFilters({ startDate: "", endDate: "", donorName: "", attendantName: "", itemName: "" })
        setInputValues({ donorName: "", attendantName: "", itemName: "" })
    }

    const loadDonations = async (activeFilters = {}, page = 0) => {
        if (activeFilters.startDate && activeFilters.endDate) {
            if (new Date(activeFilters.startDate) > new Date(activeFilters.endDate)) {
                showNotification("A data inicial não pode ser maior que a data final.", "warning")
                setDonations([])
                setPageInfo({ number: 0, totalPages: 0, totalElements: 0, size: 50 })
                return
            }
        }

        try {
            setLoading(true)
            const cleanFilters = Object.fromEntries(
                Object.entries(activeFilters).filter(([_, v]) => v !== "")
            )

            const data = await apiService.getDonationsPage(cleanFilters, page, 50)
            const mappedDonations = (data?.content || []).map(mapDonationFromBackend)
            setDonations(mappedDonations)
            setPageInfo({
                number: data?.number ?? page,
                totalPages: data?.totalPages ?? 0,
                totalElements: data?.totalElements ?? mappedDonations.length,
                size: data?.size ?? 50
            })
        } catch (err) {
            console.error("Erro ao carregar doações:", err)
            showNotification(err.message || "Erro ao carregar doações", "error")
            setDonations([])
            setPageInfo({ number: 0, totalPages: 0, totalElements: 0, size: 50 })
        } finally {
            setLoading(false)
        }
    }
    // ==========================================

    useEffect(() => {
        if (showAddModal) {
            loadDonors()
            loadItems()
        }
    }, [showAddModal])

    const handleDelete = (id) => {
        setConfirmModal({
            isOpen: true,
            action: async () => {
                try {
                    await apiService.deleteDonation(id)
                    showNotification("Doação excluída com sucesso!", "success")
                    loadDonations(filters) // Atualiza respeitando filtros
                } catch (err) {
                    console.error("Erro ao excluir doação:", err)
                    showNotification(err.message || "Erro ao excluir doação", "error")
                } finally {
                    setConfirmModal({ isOpen: false, action: null, message: "", title: "" })
                }
            },
            message: "Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita.",
            title: "Confirmar Exclusão"
        })
    }

    const loadDonors = async () => {
        try {
            const data = await apiService.getDonors()
            const mapped = (data || []).map(mapDonorFromBackend)
            setDonors(mapped)
        } catch (err) {
            showNotification("Erro ao carregar doadores", "error")
        }
    }

    const loadItems = async () => {
        try {
            const data = await apiService.getItems()
            const mapped = (data || []).map(mapItemFromBackend)
            setItems(mapped)
        } catch (err) {
            showNotification("Erro ao carregar itens", "error")
        }
    }

    const handleAdd = () => {
        setSelectedDonor(null)
        setSelectedItems([])
        setSearchDonor("")
        setSearchItem("")
        setShowDonorDropdown(false)
        setShowItemDropdown(false)
        setNewItemName("")
        setShowAddModal(true)
    }

    const filteredDonors = donors.filter(
        (d) =>
            d.nomeCompleto?.toLowerCase().includes(searchDonor.toLowerCase()) ||
            d.cpf?.includes(searchDonor)
    )

    const filteredItems = items.filter(
        (item) =>
            item.nome?.toLowerCase().includes(searchItem.toLowerCase()) ||
            item.descricao?.toLowerCase().includes(searchItem.toLowerCase())
    )

    const getDefaultCategoryId = (item) => {
        const fallback = categories.find((category) => category.name?.toLowerCase() === "outros")
            || categories[0]
        return item?.categoriaId || item?.category?.categoryId || fallback?.categoryId || ""
    }

    const handleAddExistingItem = (item) => {
        const existing = selectedItems.find((si) => !si.isNew && si.itemId === item.id)
        if (existing) {
            setSelectedItems(
                selectedItems.map((si) =>
                    !si.isNew && si.itemId === item.id
                        ? { ...si, quantity: si.quantity + 1 }
                        : si
                )
            )
        } else {
            setSelectedItems([
                ...selectedItems,
                { isNew: false, itemId: item.id, quantity: 1, item,
                    categoryId: String(getDefaultCategoryId(item)), conservationState: "GOOD" }
            ])
        }
    }

    const handleNewItemCreated = async (createdItem) => {
        setItems((currentItems) => {
            const alreadyListed = currentItems.some((item) => item.id === createdItem.id)
            return alreadyListed ? currentItems : [createdItem, ...currentItems]
        })
        setSelectedItems((currentItems) => [
            ...currentItems,
            { isNew: false, itemId: createdItem.id, quantity: 1, item: createdItem,
                categoryId: String(getDefaultCategoryId(createdItem)), conservationState: "GOOD" }
        ])
        await loadItems()
    }

    const handleUpdateQuantity = (identifier, isNew, delta) => {
        setSelectedItems(
            selectedItems.map((si) => {
                const match = isNew ? si.isNew && si.tempId === identifier : !si.isNew && si.itemId === identifier
                if (match) {
                    const newQuantity = Math.max(1, si.quantity + delta)
                    return { ...si, quantity: newQuantity }
                }
                return si
            })
        )
    }

    const handleRemoveItem = (identifier, isNew) => {
        setSelectedItems(
            selectedItems.filter((si) => {
                if (isNew) return si.tempId !== identifier
                return si.itemId !== identifier
            })
        )
    }

    const handleSubmitDonation = async (e) => {
        e.preventDefault()

        if (!selectedDonor) {
            showNotification("Selecione um doador", "error")
            return
        }

        if (selectedItems.length === 0) {
            showNotification("Adicione pelo menos um item", "error")
            return
        }

        if (selectedItems.some((item) => !item.categoryId)) {
            showNotification("Selecione a categoria de todos os itens", "error")
            return
        }

        const user = authService.getUser()
        if (!user || !user.id) {
            showNotification("Usuário não autenticado. Por favor, faça login novamente.", "error")
            return
        }

        try {
            setSubmitting(true)
            const donationData = {
                donationDate: new Date().toISOString(),
                donorId: selectedDonor.id,
                attendantUserId: user.id,
                items: selectedItems.map((si) => ({
                    itemId: si.itemId || null,
                    newItemName: si.isNew ? si.nome : null,
                    quantity: si.quantity,
                    categoryId: Number(si.categoryId),
                    conservationState: si.conservationState || "GOOD"
                }))
            }

            await apiService.createDonation(donationData)
            showNotification("Doação registrada com sucesso!", "success")
            setShowAddModal(false)
            loadDonations(filters)
        } catch (err) {
            console.error("Erro ao registrar doação:", err)
            showNotification(err.message || "Erro ao registrar doação", "error")
        } finally {
            setSubmitting(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A"
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return "N/A"
            const day = String(date.getDate()).padStart(2, "0")
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const year = date.getFullYear()
            const hours = String(date.getHours()).padStart(2, "0")
            const minutes = String(date.getMinutes()).padStart(2, "0")
            return `${day}/${month}/${year}, ${hours}:${minutes}`
        } catch (e) {
            return "N/A"
        }
    }

    const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0)

    return (
        <div className={styles.containerGeral}>
            <MenuBar />
            <Navigation />
            <div className={styles.contentWrapper}>
                <div className={styles.listContainer}>

                    <div className={styles.pageHeader}>
                        <h1 className={styles.titulo}>Doações Registradas</h1>
                        <button className={styles.addButton} data-tour="doacao-novo" onClick={handleAdd} title="Registrar Nova Doação">
                            <FaPlus />
                        </button>
                    </div>
                    <div className={styles.decoracao}></div>

                    {/* BARRA DE FILTROS ENVOLVIDA PELA REF */}
                    <div className={styles.filtersContainer} ref={dropdownRef} data-tour="doacao-filtros">
                        <div className={`${styles.formGroup} ${styles.filterGroupText}`}>
                            <input
                                type="text"
                                placeholder="Filtrar por nome do doador..."
                                value={inputValues.donorName}
                                onChange={(e) => {
                                    const value = e.target.value
                                    setInputValues(prev => ({ ...prev, donorName: value }))
                                    setFilters(prev => ({ ...prev, donorName: value }))
                                }}
                            />
                        </div>
                        <button
                            type="button"
                            className={styles.advancedFiltersButton}
                            onClick={() => setShowAdvancedFilters(prev => !prev)}
                            aria-expanded={showAdvancedFilters}
                            aria-controls="advanced-donation-filters"
                        >
                            <FaFilter aria-hidden="true" />
                            <span>Avançado</span>
                        </button>
                        {showAdvancedFilters && <div id="advanced-donation-filters" className={styles.advancedFiltersPanel}>
                        <div className={styles.dateRangeFilter}>
                            <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleDateChange}
                                    title="Data Inicial"
                                />
                            </div>
                            <span className={styles.dateSeparator}>até</span>
                            <div className={`${styles.formGroup} ${styles.filterGroupDate}`}>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleDateChange}
                                    title="Data Final"
                                />
                            </div>
                        </div>

                        {/* SELECT COM PESQUISA: Atendente */}
                        <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Filtrar por Atendente..."
                                value={inputValues.attendantName}
                                onChange={(e) => handleTextTyping("attendantName", e.target.value)}
                                onClick={() => setActiveDropdown("attendantName")}
                                autoComplete="off"
                                style={{ paddingRight: "60px" }}
                            />
                            {inputValues.attendantName && (
                                <FaTimes
                                    className={styles.clearIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionSelect("attendantName", "");
                                    }}
                                    title="Limpar Atendente"
                                />
                            )}
                            <FaChevronDown
                                className={styles.selectIcon}
                                style={{ transform: activeDropdown === "attendantName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
                            />
                            {activeDropdown === "attendantName" && (
                                <div className={styles.filterDropdown}>
                                    {filterOptions.attendants
                                        .filter(opt => opt.toLowerCase().includes(inputValues.attendantName.toLowerCase()))
                                        .map((opt, idx) => (
                                            <div
                                                key={idx}
                                                className={styles.filterDropdownItem}
                                                onClick={() => handleOptionSelect("attendantName", opt)}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    {filterOptions.attendants.filter(opt => opt.toLowerCase().includes(inputValues.attendantName.toLowerCase())).length === 0 && (
                                        <div className={styles.filterDropdownItemEmpty}>Nenhum atendente encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SELECT COM PESQUISA: Item */}
                        <div className={`${styles.formGroup} ${styles.filterGroupText}`} style={{ position: "relative" }}>
                            <input
                                type="text"
                                placeholder="Filtrar por Item..."
                                value={inputValues.itemName}
                                onChange={(e) => handleTextTyping("itemName", e.target.value)}
                                onClick={() => setActiveDropdown("itemName")}
                                autoComplete="off"
                                style={{ paddingRight: "60px" }}
                            />
                            {inputValues.itemName && (
                                <FaTimes
                                    className={styles.clearIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionSelect("itemName", "");
                                    }}
                                    title="Limpar Item"
                                />
                            )}
                            <FaChevronDown
                                className={styles.selectIcon}
                                style={{ transform: activeDropdown === "itemName" ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)" }}
                            />
                            {activeDropdown === "itemName" && (
                                <div className={styles.filterDropdown}>
                                    {filterOptions.items
                                        .filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase()))
                                        .map((opt, idx) => (
                                            <div
                                                key={idx}
                                                className={styles.filterDropdownItem}
                                                onClick={() => handleOptionSelect("itemName", opt)}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    {filterOptions.items.filter(opt => opt.toLowerCase().includes(inputValues.itemName.toLowerCase())).length === 0 && (
                                        <div className={styles.filterDropdownItemEmpty}>Nenhum item encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            className={`${styles.cancelButton} ${styles.clearFilterButton}`}
                            onClick={clearFilters}
                            title="Limpar Filtros"
                        >
                            Limpar
                        </button>
                        </div>}
                    </div>
                    {/* FIM BARRA DE FILTROS */}

                    <div className={styles.tableWrapper} data-tour="doacao-tabela">
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Doador</th>
                                    <th>Atendente</th>
                                    <th>Itens</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className={styles.loadingMessage}>Carregando...</td>
                                    </tr>
                                ) : donations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={styles.noDataMessage}>Nenhuma doação encontrada.</td>
                                    </tr>
                                ) : (
                                    donations.map((donation) => (
                                        <tr key={donation.donationId || donation.id}>
                                            <td>{formatDate(donation.donationDate)}</td>
                                            <td>{donation.donor?.name || donation.donor?.fullName || "N/A"}</td>
                                            <td>
                                                {donation.receiverUser?.name ||
                                                    donation.receiverUser?.login ||
                                                    donation.appUser?.name ||
                                                    "N/A"}
                                            </td>
                                            <td>
                                                {donation.items && donation.items.length > 0 ? (
                                                    <div>
                                                        {donation.items.map((item, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    display: "block",
                                                                    fontSize: "0.9rem",
                                                                    marginBottom: "4px"
                                                                }}
                                                            >
                                                                {item.nome || item.item?.description || "Item"} - Qtd: {item.quantity || 0}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    {isAdmin && (
                                                        <button
                                                            className={styles.deleteButton}
                                                            onClick={() => handleDelete(donation.donationId || donation.id)}
                                                            title="Excluir"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.paginationControls} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", padding: "16px 8px" }}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            disabled={pageInfo.number <= 0 || loading}
                            onClick={() => loadDonations(filters, pageInfo.number - 1)}
                        >
                            Anterior
                        </button>
                        <span aria-live="polite">
                            Página {pageInfo.totalPages === 0 ? 0 : pageInfo.number + 1} de {pageInfo.totalPages} · {pageInfo.totalElements} doações
                        </span>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            disabled={loading || pageInfo.number >= pageInfo.totalPages - 1}
                            onClick={() => loadDonations(filters, pageInfo.number + 1)}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Registrar Doação */}
            {showAddModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Registrar Doação</h2>
                        <form onSubmit={handleSubmitDonation}>
                            <div className={styles.formSection}>
                                <label>Doador *</label>
                                <input
                                    type="text"
                                    placeholder="Buscar doador por nome ou CPF..."
                                    value={searchDonor}
                                    onChange={(e) => {
                                        setSearchDonor(e.target.value)
                                        setShowDonorDropdown(
                                            e.target.value.trim() !== ""
                                        )
                                        setShowItemDropdown(false)
                                    }}
                                    onFocus={() => {
                                        if (searchDonor.trim()) {
                                            setShowDonorDropdown(true)
                                        }
                                        setShowItemDropdown(false)
                                    }}
                                    className={styles.searchInput}
                                />
                                {showDonorDropdown && searchDonor && (
                                    <div className={styles.dropdown}>
                                        {filteredDonors.length === 0 ? (
                                            <div
                                                className={styles.dropdownItem}
                                            >
                                                Nenhum doador encontrado
                                            </div>
                                        ) : (
                                            filteredDonors.map((donor) => (
                                                <div
                                                    key={donor.id}
                                                    className={
                                                        styles.dropdownItem
                                                    }
                                                    onClick={() => {
                                                        setSelectedDonor(donor)
                                                        setSearchDonor(
                                                            donor.nomeCompleto
                                                        )
                                                        setShowDonorDropdown(false)
                                                    }}
                                                >
                                                    <div>
                                                        <strong>
                                                            {donor.nomeCompleto}
                                                        </strong>
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.9rem",
                                                            color: "#666"
                                                        }}
                                                    >
                                                        CPF:{" "}
                                                        {donor.cpf || "N/A"}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                {selectedDonor && (
                                    <div className={styles.selectedInfo}>
                                        <div>
                                            <strong>Doador selecionado:</strong>{" "}
                                            {selectedDonor.nomeCompleto}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.formSection}>
                                <label>Itens da Doação *</label>

                                <div className={styles.itemSelectionContainer}>
                                    <div className={styles.searchExisting}>
                                        <input
                                            type="text"
                                            placeholder="Buscar item existente no estoque..."
                                            value={searchItem}
                                            onChange={(e) => {
                                                setSearchItem(e.target.value)
                                                setShowItemDropdown(
                                                    e.target.value.trim() !== ""
                                                )
                                                setShowDonorDropdown(false)
                                            }}
                                            onFocus={() => {
                                                if (searchItem.trim()) {
                                                    setShowItemDropdown(true)
                                                }
                                                setShowDonorDropdown(false)
                                            }}
                                            className={styles.searchInput}
                                        />
                                        {showItemDropdown && searchItem && (
                                            <div className={styles.dropdown}>
                                                {filteredItems.length === 0 ? (
                                                    <div
                                                        className={
                                                            styles.dropdownItem
                                                        }
                                                    >
                                                        Nenhum item encontrado
                                                    </div>
                                                ) : (
                                                    filteredItems.map(
                                                        (item) => (
                                                            <div
                                                                key={item.id}
                                                                className={
                                                                    styles.dropdownItem
                                                                }
                                                                onClick={() => {
                                                                    handleAddExistingItem(
                                                                        item
                                                                    )
                                                                    setSearchItem("")
                                                                    setShowItemDropdown(false)
                                                                }}
                                                            >
                                                                <div>
                                                                    <strong>
                                                                        {item.nome ||
                                                                            item.descricao}
                                                                    </strong>
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "0.9rem",
                                                                        color: "#666"
                                                                    }}
                                                                >
                                                                    Estoque
                                                                    Atual:{" "}
                                                                    {
                                                                        item.quantidade
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.divider}>
                                        <span>OU</span>
                                    </div>

                                    <div className={styles.createNewItem}>
                                        <button
                                            type="button"
                                            onClick={() => setShowNewItemModal(true)}
                                            className={styles.addSecondaryButton}
                                        >
                                            Cadastrar novo item
                                        </button>
                                    </div>
                                </div>

                                {selectedItems.length > 0 && (
                                    <div
                                        className={
                                            styles.selectedItemsContainer
                                        }
                                    >
                                        <h3
                                            style={{
                                                fontSize: "1rem",
                                                marginBottom: "10px",
                                                color: "#333"
                                            }}
                                        >
                                            Itens Selecionados
                                        </h3>
                                        {selectedItems.map((si) => (
                                            <div
                                                key={
                                                    si.isNew
                                                        ? si.tempId
                                                        : si.itemId
                                                }
                                                className={styles.selectedItem}
                                            >
                                                <div className={styles.itemInfo}>
                                                    <strong>
                                                        {si.isNew
                                                            ? si.nome
                                                            : si.item?.nome || si.item?.descricao || "Item"}
                                                    </strong>
                                                    {si.isNew && <span className={styles.newItemBadge}>Novo Item</span>}
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, width: "100%", marginTop: 8 }}>
                                                        <label style={{ display: "grid", gap: 4, fontSize: "0.8rem" }}>
                                                            Categoria
                                                            <select
                                                                value={si.categoryId || ""}
                                                                onChange={(event) => setSelectedItems((current) => current.map((entry) =>
                                                                    entry.itemId === si.itemId ? { ...entry, categoryId: event.target.value } : entry
                                                                ))}
                                                                required
                                                                style={{ width: "100%", padding: "8px", fontSize: "0.9rem" }}
                                                            >
                                                                <option value="">Selecione</option>
                                                                {categories.map((category) => (
                                                                    <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
                                                                ))}
                                                            </select>
                                                        </label>
                                                        <label style={{ display: "grid", gap: 4, fontSize: "0.8rem" }}>
                                                            Estado de conservação
                                                            <select
                                                                value={si.conservationState || "GOOD"}
                                                                onChange={(event) => setSelectedItems((current) => current.map((entry) =>
                                                                    entry.itemId === si.itemId ? { ...entry, conservationState: event.target.value } : entry
                                                                ))}
                                                                required
                                                                style={{ width: "100%", padding: "8px", fontSize: "0.9rem" }}
                                                            >
                                                                <option value="NEW">Novo</option>
                                                                <option value="GOOD">Bom</option>
                                                                <option value="FAIR">Regular</option>
                                                                <option value="POOR">Ruim</option>
                                                            </select>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        styles.itemControls
                                                    }
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateQuantity(
                                                                si.isNew
                                                                    ? si.tempId
                                                                    : si.itemId,
                                                                si.isNew,
                                                                -1
                                                            )
                                                        }
                                                        disabled={
                                                            si.quantity <= 1
                                                        }
                                                        className={
                                                            styles.quantityButton
                                                        }
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span
                                                        className={
                                                            styles.quantity
                                                        }
                                                    >
                                                        {si.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateQuantity(
                                                                si.isNew
                                                                    ? si.tempId
                                                                    : si.itemId,
                                                                si.isNew,
                                                                1
                                                            )
                                                        }
                                                        className={
                                                            styles.quantityButton
                                                        }
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveItem(
                                                                si.isNew
                                                                    ? si.tempId
                                                                    : si.itemId,
                                                                si.isNew
                                                            )
                                                        }
                                                        className={
                                                            styles.removeButton
                                                        }
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className={styles.total}>
                                            <strong>
                                                Total de itens: {totalItems}
                                            </strong>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    type="button"
                                    className={styles.cancelButton}
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={
                                        submitting ||
                                        !selectedDonor ||
                                        selectedItems.length === 0
                                    }
                                >
                                    {submitting
                                        ? "Registrando..."
                                        : "Registrar Doação"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showNewItemModal && (
                <NewItemModal
                    onClose={() => setShowNewItemModal(false)}
                    onCreated={handleNewItemCreated}
                />
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() =>
                    setConfirmModal({
                        isOpen: false,
                        action: null,
                        message: "",
                        title: ""
                    })
                }
                onConfirm={confirmModal.action}
                message={confirmModal.message}
                title={confirmModal.title}
            />
        </div>
    )
}
