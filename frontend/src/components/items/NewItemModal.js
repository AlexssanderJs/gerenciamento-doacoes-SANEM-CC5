"use client"

import { useState } from "react"
import apiService from "../../services/api"
import { mapItemFromBackend, mapItemToBackend } from "../../services/dataMapper"
import { useNotification } from "../notifications/NotificationProvider"
import styles from "./NewItemModal.module.css"

const emptyItem = {
    nome: "",
    tagCode: "",
    estoqueMinimo: "",
    size: "",
    gender: "",
    type: "",
    conditionStatus: "",
    location: "Medianeira"
}

export default function NewItemModal({ onClose, onCreated }) {
    const { showNotification } = useNotification()
    const [item, setItem] = useState(emptyItem)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (!item.nome.trim()) {
            showNotification("Informe o nome do item", "error")
            return
        }

        try {
            setSubmitting(true)
            const createdItem = await apiService.createItem(
                mapItemToBackend({
                    nome: item.nome,
                    quantidade: 0,
                    tagCode: item.tagCode,
                    estoqueMinimo: item.estoqueMinimo,
                    size: item.size,
                    gender: item.gender,
                    type: item.type,
                    conditionStatus: item.conditionStatus,
                    location: item.location
                })
            )
            const mappedItem = mapItemFromBackend(createdItem)
            await onCreated(mappedItem)
            showNotification("Item criado com sucesso!", "success")
            setItem(emptyItem)
            onClose()
        } catch (err) {
            showNotification(err.message || "Erro ao criar item", "error")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-item-modal-title"
            >
                <h2 id="new-item-modal-title">Cadastrar novo item</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="newItemName">Nome *</label>
                        <input
                            id="newItemName"
                            type="text"
                            required
                            value={item.nome}
                            onChange={(event) =>
                                setItem({ ...item, nome: event.target.value })
                            }
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="newItemTag">Código/Tag (opcional)</label>
                        <input
                            id="newItemTag"
                            type="text"
                            value={item.tagCode}
                            onChange={(event) =>
                                setItem({ ...item, tagCode: event.target.value })
                            }
                            placeholder="Ex: PROD-ABC-123"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="newItemMinimumStock">Estoque mínimo (opcional)</label>
                        <input
                            id="newItemMinimumStock"
                            type="number"
                            min={0}
                            value={item.estoqueMinimo}
                            onChange={(event) =>
                                setItem({ ...item, estoqueMinimo: event.target.value })
                            }
                        />
                    </div>

                    <div className={styles.attributesGrid}>
                        <div className={styles.formGroup}>
                            <label htmlFor="newItemSize">Tamanho</label>
                            <select
                                id="newItemSize"
                                value={item.size}
                                onChange={(event) =>
                                    setItem({ ...item, size: event.target.value })
                                }
                            >
                                <option value="">Selecione</option>
                                <option value="PP">PP</option>
                                <option value="P">P</option>
                                <option value="M">M</option>
                                <option value="G">G</option>
                                <option value="GG">GG</option>
                                <option value="Único">Único</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="newItemGender">Gênero</label>
                            <select
                                id="newItemGender"
                                value={item.gender}
                                onChange={(event) =>
                                    setItem({ ...item, gender: event.target.value })
                                }
                            >
                                <option value="">Selecione</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Unissex">Unissex</option>
                                <option value="Infantil">Infantil</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="newItemType">Tipo</label>
                            <input
                                id="newItemType"
                                type="text"
                                value={item.type}
                                onChange={(event) =>
                                    setItem({ ...item, type: event.target.value })
                                }
                                placeholder="Ex.: Camisa"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="newItemCondition">Estado de conservação</label>
                            <select
                                id="newItemCondition"
                                value={item.conditionStatus}
                                onChange={(event) =>
                                    setItem({ ...item, conditionStatus: event.target.value })
                                }
                            >
                                <option value="">Selecione</option>
                                <option value="Novo">Novo</option>
                                <option value="Bom">Bom</option>
                                <option value="Regular">Regular</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="newItemLocation">Localização</label>
                            <input
                                id="newItemLocation"
                                type="text"
                                value={item.location}
                                onChange={(event) =>
                                    setItem({ ...item, location: event.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.submitButton} disabled={submitting}>
                            {submitting ? "Cadastrando..." : "Cadastrar item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
