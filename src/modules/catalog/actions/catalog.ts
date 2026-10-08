'use server'
import * as categories from '../services/catalog'
import * as assets from '../services/assets'
import { mutate } from '@/modules/shared/services/mutation'
export async function loadCategories() { return categories.getCategories() }
export async function loadImages() { return assets.getAssets() }
export async function saveCategory(input: unknown, id?: string) { return mutate(() => categories.saveCategory(input, id)) }
export async function removeCategory(id: string) { return mutate(() => categories.deleteCategory(id)) }
export async function uploadImage(form: FormData) { return mutate(() => assets.uploadImage(form)) }
