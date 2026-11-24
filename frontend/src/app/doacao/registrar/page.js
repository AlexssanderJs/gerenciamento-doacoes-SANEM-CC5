"use client"
import React, { useState, useEffect } from "react"
import MenuBar from "../../components/menubar/menubar"
import Navigation from "../../components/navegation/navegation"
import { useRouter } from "next/navigation"
import styles from "./registrar.module.css"
import apiService from "../../../services/api"
import { useNotification } from "../../../components/notifications/NotificationProvider"
import {
    mapDonorFromBackend,
    mapItemFromBackend
} from "../../../services/dataMapper"
import authService from "../../../services/authService"
import { FaPlus, FaTrash, FaMinus } from "react-icons/fa"
import NewItemModal from "../../../components/items/NewItemModal"

let rowCounter = 0
const nextRowId = () => `row-${Date.now()}-${++rowCounter}`
const CONSERVATION_STATES = ["NEW", "GOOD", "FAIR", "POOR"]

export default function RegistrarDoacaoPage() {
    const router = useRouter()
    const { showNotification } = useNotification()

    const [donors, setDonors] = useState([])
    const [items, setItems] = useState([])
    const [categories, setCategories] = useState([])

    const [selectedDonor, setSelectedDonor] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])

    const [searchDonor, setSearchDonor] = useState("")
    const [searchItem, setSearchItem] = useState("")

    const [showNewItemModal, setShowNewItemModal] = useState(false)
    // RF20: itemId -> demanda prioritária ativa (para destacar na busca)
    const [demandByItem, setDemandByItem] = useState({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadItems()
        loadCategories()
        loadPriorityDemands()
    }, [])

    const loadCategories = async () => {
        try {
            const data = await apiService.getCategories()
            setCategories((data || []).filter((category) => !category.deletedAt))
        } catch (err) {
            console.error("Erro ao carregar categorias:", err)
            showNotification("Erro ao carregar categorias", "error")
        }
    }

    const getDefaultCategoryId = (item) => {
        const fallback = categories.find((category) => category.name?.toLowerCase() === "outros")
            || categories[0]
        return item?.categoriaId || fallback?.categoryId || ""
    }

    const loadPriorityDemands = async () => {
        try {
            const data = await apiService.getPriorityDemands({ status: "ACTIVE" })
            const map = {}
            ;(data || []).filter((d) => !d.fulfilled).forEach((d) => {
                // se houver mais de uma demanda para o item, mantém a primeira (já vem ordenada por prioridade)
                if (!map[d.itemId]) map[d.itemId] = d
            })
            setDemandByItem(map)
        } catch {
            setDemandByItem({}) // destaque é opcional: não bloqueia o registro da doação
        }
    }

    // RNF05: busca de doadores no servidor, com debounce, em vez de carregar todos de uma vez
    useEffect(() => {
        const term = searchDonor.trim()
        if (!term || selectedDonor) {
            setDonors([])
            return
        }
        let active = true
        const timer = setTimeout(async () => {
            try {
                const data = await apiService.searchDonors(term)
                if (active) setDonors((data || []).map(mapDonorFromBackend))
            } catch (err) {
                console.error("Erro ao buscar doadores:", err)
                if (active) showNotification("Erro ao buscar doadores", "error")
            }
        }, 300)
        return () => {
            active = false
            clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchDonor, selectedDonor])

    const loadItems = async () => {
        try {
            const data = await apiService.getItems()
            const mapped = (data || []).map(mapItemFromBackend)
            setItems(mapped)
        } catch (err) {
            console.error("Erro ao carregar itens:", err)
            showNotification("Erro ao carregar itens", "error")
        }
    }

    const filteredDonors = donors

    const filteredItems = items.filter(
        (item) =>
            item.nome?.toLowerCase().includes(searchItem.toLowerCase()) ||
            item.descricao?.toLowerCase().includes(searchItem.toLowerCase())
    )

    const handleAddExistingItem = (item) => {
        const existing = selectedItems.find(
            (si) => !si.isNew && si.itemId === item.id
        )
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
                {
                    rowId: nextRowId(),
                    isNew: false,
                    itemId: item.id,
                    quantity: 1,
                    item,
                    categoryId: String(getDefaultCategoryId(item)),
                    conservationState: "GOOD"
                }
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
            {
                isNew: false,
                itemId: createdItem.id,
                quantity: 1,
                item: createdItem,
                categoryId: String(getDefaultCategoryId(createdItem)),
                conservationState: "GOOD"
            }
        ])
        await loadItems()
    }

    const handleUpdateQuantity = (rowId, delta) => {
        setSelectedItems((current) =>
            current.map((si) =>
                si.rowId === rowId
                    ? { ...si, quantity: Math.max(1, si.quantity + delta) }
                    : si
            )
        )
    }

    const handleRemoveItem = (rowId) => {
        setSelectedItems((current) => current.filter((si) => si.rowId !== rowId))
    }

    // RF04: o mesmo item pode ser registrado em outro estado de conservação na mesma doação
    const handleDuplicateRow = (rowId) => {
        setSelectedItems((current) => {
            const index = current.findIndex((si) => si.rowId === rowId)
            if (index < 0) return current
            const source = current[index]
            const usedStates = current
                .filter((si) => si.itemId === source.itemId)
                .map((si) => si.conservationState)
            const freeState = CONSERVATION_STATES.find((state) => !usedStates.includes(state))
            if (!freeState) {
                showNotification("Este item já está em todos os estados de conservação.", "error")
                return current
            }
            const copy = { ...source, rowId: nextRowId(), quantity: 1, conservationState: freeState }
            return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)]
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedDonor) {
            showNotification("Selecione um doador", "error")
            return
        }

        if (selectedItems.length === 0) {
            showNotification("Adicione pelo menos um item", "error")
            return
        }

        const user = authService.getUser()
        if (!user || !user.id) {
            showNotification(
                "Usuário não autenticado. Por favor, faça login novamente.",
                "error"
            )
            return
        }

        const seenLines = new Set()
        for (const si of selectedItems) {
            const key = `${si.itemId}:${si.conservationState || "GOOD"}`
            if (seenLines.has(key)) {
                showNotification(
                    "O mesmo item não pode se repetir com o mesmo estado de conservação. Altere o estado ou some as quantidades.",
                    "error"
                )
                return
            }
            seenLines.add(key)
        }

        if (selectedItems.some((si) => !si.categoryId)) {
            showNotification("Selecione a categoria de todos os itens", "error")
            return
        }

        try {
            setSubmitting(true)

            const donationData = {
                donationDate: new Date().toISOString(),
                donorId: selectedDonor.id,
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
            router.push("/doacao/lista")
        } catch (err) {
            console.error("Erro ao registrar doação:", err)
            showNotification(err.message || "Erro ao registrar doação", "error")
            setSubmitting(false)
        }
    }

    const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0)

    return (
        <div className={styles.containerGeral}>
            <MenuBar />
            <Navigation />
            <div className={styles.contentWrapper}>
                <div className={styles.formContainer}>
                    <h1 className={styles.titulo}>Registrar Doação</h1>
                    <div className={styles.decoracao}></div>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.section} data-tour="doacao-doador">
                            <h2>1. Selecionar Doador</h2>
                            <div className={styles.searchBox}>
                                <input
                                    type="text"
                                    placeholder="Buscar doador por nome ou CPF..."
                                    value={searchDonor}
                                    onChange={(e) =>
                                        setSearchDonor(e.target.value)
                                    }
                                    className={styles.searchInput}
                                />
                            </div>

                            {searchDonor && !selectedDonor && (
                                <div className={styles.dropdown}>
                                    {filteredDonors.length === 0 ? (
                                        <div className={styles.dropdownItem}>
                                            Nenhum doador encontrado
                                        </div>
                                    ) : (
                                        filteredDonors.map((donor) => (
                                            <div
                                                key={donor.id}
                                                className={styles.dropdownItem}
                                                onClick={() => {
                                                    setSelectedDonor(donor)
                                                    setSearchDonor("")
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
                                                    CPF: {donor.cpf || "N/A"}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {selectedDonor && (
                                <div className={styles.selectedBeneficiary}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center"
                                        }}
                                    >
                                        <div>
                                            <strong>Doador Selecionado:</strong>{" "}
                                            {selectedDonor.nomeCompleto} <br />
                                            <span
                                                style={{
                                                    fontSize: "0.9rem",
                                                    color: "#555"
                                                }}
                                            >
                                                CPF:{" "}
                                                {selectedDonor.cpf || "N/A"}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedDonor(null)
                                            }
                                            className={styles.removeButton}
                                            title="Remover Doador"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.section}>
                            <h2>2. Itens da Doação</h2>

                            <div className={styles.itemSelectionContainer}>
                                <div className={styles.searchBox} data-tour="doacao-buscar-item">
                                    <input
                                        type="text"
                                        placeholder="Buscar item existente no estoque..."
                                        value={searchItem}
                                        onChange={(e) =>
                                            setSearchItem(e.target.value)
                                        }
                                        className={styles.searchInput}
                                    />
                                    {searchItem && (
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
                                                filteredItems.map((item) => (
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
                                                            Estoque Atual:{" "}
                                                            {item.quantidade}
                                                        </div>
                                                        {demandByItem[item.id] && (
                                                            <div className={styles.demandBadge}>
                                                                Demanda prioritária: faltam{" "}
                                                                {demandByItem[item.id].quantityRemaining}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={styles.divider}>
                                    <span>OU</span>
                                </div>

                                <div className={styles.newItemInputGroup} data-tour="doacao-novo-item">
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
                                <div className={styles.selectedItems}>
                                    <h3>Itens Adicionados</h3>
                                    {selectedItems.map((si) => (
                                        <div
                                            key={si.rowId}
                                            className={styles.selectedItem}
                                        >
                                            <div className={styles.itemInfo}>
                                                <strong>
                                                    {si.isNew
                                                        ? si.nome
                                                        : si.item?.nome ||
                                                          si.item?.descricao ||
                                                          "Item"}
                                                </strong>
                                                {si.isNew && (
                                                    <span
                                                        className={
                                                            styles.newItemBadge
                                                        }
                                                    >
                                                        Novo Item
                                                    </span>
                                                )}
                                            </div>

                                            <div className={styles.itemMetadataControls}>
                                                <label>
                                                    Categoria
                                                    <select
                                                        value={si.categoryId || ""}
                                                        onChange={(e) => setSelectedItems((current) => current.map((entry) =>
                                                            entry.rowId === si.rowId ? { ...entry, categoryId: e.target.value } : entry
                                                        ))}
                                                        required
                                                    >
                                                        <option value="">Selecione</option>
                                                        {categories.map((category) => (
                                                            <option key={category.categoryId} value={category.categoryId}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                                <label>
                                                    Conservação
                                                    <select
                                                        value={si.conservationState || "GOOD"}
                                                        onChange={(e) => setSelectedItems((current) => current.map((entry) =>
                                                            entry.rowId === si.rowId ? { ...entry, conservationState: e.target.value } : entry
                                                        ))}
                                                        required
                                                    >
                                                        <option value="NEW">Novo</option>
                                                        <option value="GOOD">Bom</option>
                                                        <option value="FAIR">Regular</option>
                                                        <option value="POOR">Ruim</option>
                                                    </select>
                                                </label>
                                            </div>

                                            <div
                                                className={styles.itemControls}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(si.rowId, -1)
                                                    }
                                                    disabled={si.quantity <= 1}
                                                    className={
                                                        styles.quantityButton
                                                    }
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span
                                                    className={styles.quantity}
                                                >
                                                    {si.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(si.rowId, 1)
                                                    }
                                                    className={
                                                        styles.quantityButton
                                                    }
                                                >
                                                    <FaPlus />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicateRow(si.rowId)}
                                                    className={styles.quantityButton}
                                                    title="Adicionar o mesmo item em outro estado de conservação"
                                                    aria-label="Adicionar o mesmo item em outro estado de conservação"
                                                >
                                                    <FaPlus /><small>estado</small>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveItem(si.rowId)
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

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => router.push("/doacao/lista")}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className={styles.submitButton}
                                data-tour="doacao-registrar"
                                disabled={
                                    submitting ||
                                    !selectedDonor ||
                                    selectedItems.length === 0
                                }
                            >
                                {submitting
                                    ? "Registrando..."
                                    : "Confirmar Doação"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {showNewItemModal && (
                <NewItemModal
                    onClose={() => setShowNewItemModal(false)}
                    onCreated={handleNewItemCreated}
                />
            )}
        </div>
    )
}
