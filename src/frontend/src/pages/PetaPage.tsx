import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  MapPin,
  Package,
  Search,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AidTypeBadge } from "../components/StatusBadge";
import {
  useGetAllAidRecipients,
  useGetRecipientsByDistrict,
} from "../hooks/useQueries";
import { formatNumber } from "../utils/format";

// Koordinat kabupaten/kota seluruh Indonesia (34 provinsi)
const DISTRICT_COORDS: Record<string, [number, number]> = {
  // ── ACEH ──
  "Banda Aceh": [5.5483, 95.3238],
  "Aceh Besar": [5.4677, 95.5313],
  Sabang: [5.8866, 95.3186],
  Pidie: [5.1612, 96.1312],
  "Pidie Jaya": [5.2285, 96.2827],
  Bireuen: [5.2038, 96.7031],
  "Aceh Utara": [5.0724, 97.0916],
  Lhokseumawe: [5.1801, 97.1502],
  "Aceh Timur": [4.6433, 97.8141],
  Langsa: [4.4683, 97.9679],
  "Aceh Tamiang": [4.2861, 98.0842],
  "Aceh Tengah": [4.6167, 96.8667],
  "Bener Meriah": [4.7267, 96.9161],
  "Gayo Lues": [3.9467, 97.4631],
  "Aceh Tenggara": [3.5892, 97.7927],
  "Aceh Selatan": [3.3028, 97.4289],
  "Aceh Singkil": [2.2799, 97.7896],
  Subulussalam: [2.6428, 98.0],
  "Nagan Raya": [4.105, 96.3697],
  "Aceh Barat Daya": [3.7167, 96.8333],
  "Aceh Barat": [4.1553, 96.0498],
  Simeulue: [2.6167, 96.1],
  Abdya: [3.7167, 96.8333],
  Meulaboh: [4.1434, 96.1282],

  // ── SUMATERA UTARA ──
  Medan: [3.5952, 98.6722],
  Binjai: [3.6003, 98.4851],
  Pematangsiantar: [2.9595, 99.0687],
  Tebing: [3.3285, 99.1504],
  Karo: [3.1167, 98.5167],
  Langkat: [3.9667, 98.3667],
  "Deli Serdang": [3.5503, 98.8489],
  Serdangbedagai: [3.3167, 99.0667],
  Asahan: [2.9667, 99.8833],
  Batubara: [3.0167, 99.4167],
  Simalungun: [2.9667, 99.0667],
  Tapanuli: [2.2667, 98.9833],
  "Tapanuli Tengah": [1.9667, 98.7167],
  "Tapanuli Selatan": [1.3167, 99.0667],
  Labuhanbatu: [2.1167, 100.0833],
  "Labuhanbatu Utara": [2.5167, 99.5833],
  "Labuhanbatu Selatan": [1.8333, 100.1833],
  Dairi: [2.7167, 98.3],
  Pakpak: [2.65, 98.1667],
  "Humbang Hasundutan": [2.3333, 98.6667],
  Samosir: [2.6167, 98.9],
  Toba: [2.65, 99.0667],
  Nias: [1.0833, 97.75],
  "Nias Utara": [1.35, 97.5833],
  "Nias Barat": [1.0833, 97.5333],
  "Nias Selatan": [0.5667, 97.8],
  Gunungsitoli: [1.2833, 97.6167],
  Mandailing: [0.8667, 99.35],
  Padanglawas: [1.4333, 99.6833],
  "Padanglawas Utara": [1.6833, 99.3],
  Sibolga: [1.7422, 98.7792],

  // ── SUMATERA BARAT ──
  Padang: [-0.9492, 100.3543],
  Bukittinggi: [-0.3031, 100.3697],
  Payakumbuh: [-0.2213, 100.6336],
  Solok: [-0.7953, 100.6561],
  Sawahlunto: [-0.6833, 100.7833],
  Pariaman: [-0.6234, 100.1169],
  Padangpanjang: [-0.4667, 100.4],
  "Padang Pariaman": [-0.5, 100.1167],
  "Tanah Datar": [-0.4667, 100.5],
  Agam: [-0.2833, 100.1],
  "Lima Puluh Kota": [-0.2833, 100.7167],
  "Kepulauan Mentawai": [-1.9, 99.5667],
  Sijunjung: [-0.6833, 100.9667],
  Dharmasraya: [-1.05, 101.5],
  "Solok Selatan": [-1.5333, 101.0833],
  Pasaman: [0.1, 99.9333],
  "Pasaman Barat": [0.0833, 99.6833],

  // ── RIAU ──
  Pekanbaru: [0.5333, 101.45],
  Dumai: [1.6667, 101.45],
  Kampar: [0.3333, 101.0],
  Siak: [0.9333, 102.0],
  Bengkalis: [1.4833, 102.1],
  "Rokan Hulu": [0.9, 100.65],
  "Rokan Hilir": [2.1167, 100.9833],
  "Indragiri Hulu": [-0.3333, 102.4167],
  "Indragiri Hilir": [-0.5, 103.3],
  Pelalawan: [0.25, 102.2167],
  Kuantan: [-0.35, 101.5333],
  "Kepulauan Meranti": [1.15, 102.75],

  // ── KEPULAUAN RIAU ──
  Batam: [1.1301, 104.0529],
  Tanjungpinang: [0.9167, 104.45],
  Bintan: [1.1167, 104.4833],
  Karimun: [1.0, 103.45],
  Natuna: [3.6167, 108.15],
  Lingga: [0.2167, 104.6167],
  "Kepulauan Anambas": [3.3167, 106.1667],

  // ── JAMBI ──
  Jambi: [-1.6, 103.6167],
  Sungaipenuh: [-2.1333, 101.4167],
  Batanghari: [-1.5, 103.05],
  Muarojambi: [-1.5, 103.6167],
  "Tanjung Jabung Barat": [-1.0833, 103.1],
  "Tanjung Jabung Timur": [-0.85, 103.8167],
  Sarolangun: [-2.4, 102.6833],
  Bungo: [-1.4667, 102.1333],
  Tebo: [-1.5167, 102.2167],
  Merangin: [-2.1, 102.3833],
  Kerinci: [-2.05, 101.45],

  // ── SUMATERA SELATAN ──
  Palembang: [-2.9761, 104.7754],
  Prabumulih: [-3.4167, 104.25],
  Pagar: [-3.0167, 104.0167],
  Lubuklinggau: [-3.3, 102.8667],
  Musi: [-3.0, 104.3667],
  "Musi Banyuasin": [-2.4, 103.8667],
  "Musi Rawas": [-3.3333, 102.8167],
  "Musi Rawas Utara": [-3.0, 103.0],
  Lahat: [-3.7833, 103.55],
  Muara: [-3.4667, 103.95],
  Empatlawang: [-3.8, 103.8667],
  "Ogan Komering Ulu": [-4.0, 104.1],
  "OKU Timur": [-4.1667, 104.5333],
  "OKU Selatan": [-4.3333, 103.8],
  "Ogan Komering Ilir": [-3.4167, 105.0],
  Ogan: [-3.4667, 104.5],
  Banyuasin: [-2.6167, 104.3167],
  "Penukal Abab": [-3.5667, 104.1167],

  // ── BANGKA BELITUNG ──
  Pangkalpinang: [-2.1286, 106.1139],
  Bangka: [-2.2, 106.1],
  "Bangka Barat": [-1.9333, 105.5],
  "Bangka Tengah": [-2.3333, 106.0],
  "Bangka Selatan": [-2.8333, 106.3833],
  Belitung: [-2.8167, 107.6333],
  "Belitung Timur": [-2.7167, 108.15],

  // ── BENGKULU ──
  Bengkulu: [-3.7928, 102.2608],
  "Bengkulu Utara": [-3.3333, 101.9667],
  "Bengkulu Tengah": [-3.6667, 102.4167],
  "Bengkulu Selatan": [-4.4167, 102.9],
  Rejang: [-3.3167, 102.5167],
  Kepahiang: [-3.65, 102.5833],
  Lebong: [-3.0167, 102.3667],
  Seluma: [-3.9167, 102.5333],
  Kaur: [-4.7, 103.4667],
  Mukomuko: [-2.5333, 101.1],

  // ── LAMPUNG ──
  "Bandar Lampung": [-5.4292, 105.2618],
  Metro: [-5.1167, 105.3167],
  "Lampung Utara": [-4.8667, 104.7667],
  "Lampung Selatan": [-5.7, 105.5],
  "Lampung Barat": [-5.1333, 104.1667],
  "Lampung Tengah": [-4.8167, 105.15],
  "Lampung Timur": [-5.1, 105.8],
  Tulangbawang: [-4.4167, 105.6167],
  "Tulang Bawang Barat": [-4.3333, 105.3],
  Mesuji: [-4.0667, 105.65],
  Tanggamus: [-5.4167, 104.7833],
  Pringsewu: [-5.3667, 104.9667],
  Pesawaran: [-5.4, 105.1],
  "Pesisir Barat": [-5.25, 103.9167],
  Waykanan: [-4.5, 104.3333],

  // ── BANTEN ──
  Serang: [-6.1201, 106.1503],
  Cilegon: [-6.0, 106.05],
  Tangerang: [-6.1753, 106.6297],
  "Tangerang Selatan": [-6.2833, 106.7167],
  Lebak: [-6.5833, 106.25],
  Pandeglang: [-6.2667, 105.9667],
  "Tangerang Kab": [-6.1833, 106.55],
  "Serang Kab": [-6.1, 106.05],

  // ── DKI JAKARTA ──
  Jakarta: [-6.2088, 106.8456],
  "Jakarta Utara": [-6.1167, 106.8833],
  "Jakarta Selatan": [-6.2833, 106.8167],
  "Jakarta Timur": [-6.2167, 106.95],
  "Jakarta Barat": [-6.1667, 106.7167],
  "Jakarta Pusat": [-6.2, 106.8333],
  "Kepulauan Seribu": [-5.6167, 106.55],

  // ── JAWA BARAT ──
  Bandung: [-6.9175, 107.6191],
  Bekasi: [-6.2349, 107.0004],
  Bogor: [-6.5971, 106.806],
  Cimahi: [-6.8833, 107.5333],
  Cirebon: [-6.7063, 108.5571],
  Depok: [-6.4, 106.8167],
  Sukabumi: [-6.9167, 106.9167],
  Tasikmalaya: [-7.3167, 108.2167],
  Banjar: [-7.3667, 108.5333],
  Subang: [-6.5667, 107.7667],
  Purwakarta: [-6.5333, 107.4667],
  Karawang: [-6.3167, 107.3333],
  Cianjur: [-6.8167, 107.15],
  Garut: [-7.2167, 107.9],
  Majalengka: [-6.8333, 108.2333],
  Sumedang: [-6.85, 107.9167],
  Kuningan: [-6.9667, 108.5],
  Indramayu: [-6.3333, 108.3167],

  // ── JAWA TENGAH ──
  Semarang: [-6.9667, 110.4167],
  Solo: [-7.5667, 110.8167],
  Magelang: [-7.4667, 110.2167],
  Salatiga: [-7.3167, 110.5],
  Pekalongan: [-6.8833, 109.6667],
  Tegal: [-6.8667, 109.1333],
  Surakarta: [-7.5667, 110.8333],
  Kudus: [-6.8, 110.8333],
  Jepara: [-6.6, 110.65],
  Rembang: [-6.7, 111.35],
  Blora: [-6.9667, 111.4167],
  Grobogan: [-7.0167, 110.9167],
  Demak: [-6.8833, 110.6333],
  Kendal: [-6.9167, 110.1667],
  Batang: [-6.9, 109.7333],
  "Kota Pekalongan": [-6.8833, 109.6667],
  Pemalang: [-6.9, 109.3833],
  "Kota Tegal": [-6.8667, 109.1333],
  Brebes: [-6.8667, 109.05],
  Banyumas: [-7.5167, 109.3],
  Cilacap: [-7.7333, 109.0],
  Kebumen: [-7.6667, 109.65],
  Purworejo: [-7.7167, 110.0167],
  Wonosobo: [-7.3667, 109.9],
  Temanggung: [-7.3167, 110.1667],
  Boyolali: [-7.5333, 110.6],
  Klaten: [-7.7, 110.6167],
  Wonogiri: [-7.8167, 110.9167],
  Karanganyar: [-7.6167, 110.9833],
  Sragen: [-7.4333, 111.0333],
  Sukoharjo: [-7.6833, 110.8333],
  Pati: [-6.75, 111.0333],
  Juwana: [-6.7167, 111.15],

  // ── DI YOGYAKARTA ──
  Yogyakarta: [-7.7956, 110.3695],
  Bantul: [-7.9333, 110.3333],
  Sleman: [-7.7167, 110.3667],
  Kulonprogo: [-7.8167, 110.15],
  Gunungkidul: [-8.0, 110.6167],

  // ── JAWA TIMUR ──
  Surabaya: [-7.2575, 112.7521],
  Malang: [-7.9778, 112.6267],
  Pasuruan: [-7.65, 112.9],
  Probolinggo: [-7.75, 113.2167],
  Mojokerto: [-7.4667, 112.4333],
  Kediri: [-7.8167, 112.0],
  Blitar: [-8.1, 112.15],
  Madiun: [-7.6333, 111.5167],
  Batu: [-7.8, 112.5167],
  Jember: [-8.1667, 113.7],
  Jombang: [-7.55, 112.2333],
  Nganjuk: [-7.6, 111.9167],
  Lamongan: [-7.1167, 112.4167],
  Gresik: [-7.1667, 112.65],
  Bangkalan: [-6.9, 112.7333],
  Sampang: [-7.1833, 113.25],
  Pamekasan: [-7.1667, 113.4667],
  Sumenep: [-6.9333, 113.8667],
  Sidoarjo: [-7.45, 112.7167],
  Bojonegoro: [-7.15, 111.8833],
  Tuban: [-6.9, 112.05],
  Ngawi: [-7.4167, 111.45],
  Magetan: [-7.65, 111.3333],
  Ponorogo: [-7.8667, 111.5],
  Pacitan: [-8.1833, 111.1],
  Trenggalek: [-8.0667, 111.7],
  Tulungagung: [-8.0667, 111.9],
  Lumajang: [-8.1333, 113.2167],
  Bondowoso: [-7.9167, 113.8167],
  Situbondo: [-7.7, 114.0],
  Banyuwangi: [-8.2167, 114.35],

  // ── BALI ──
  Denpasar: [-8.6705, 115.2126],
  Badung: [-8.65, 115.2167],
  Gianyar: [-8.5333, 115.3167],
  Tabanan: [-8.5333, 115.1167],
  Jembrana: [-8.35, 114.6167],
  Buleleng: [-8.1167, 115.0833],
  Klungkung: [-8.5167, 115.4],
  Bangli: [-8.4667, 115.3167],
  Karangasem: [-8.45, 115.6167],

  // ── NUSA TENGGARA BARAT ──
  Mataram: [-8.5833, 116.1167],
  Bima: [-8.4667, 118.7167],
  Lombok: [-8.6667, 116.3333],
  "Lombok Barat": [-8.6, 116.0833],
  "Lombok Tengah": [-8.75, 116.35],
  "Lombok Timur": [-8.5667, 116.6167],
  "Lombok Utara": [-8.3667, 116.2167],
  Sumbawa: [-8.4833, 117.4167],
  "Sumbawa Barat": [-8.7333, 116.9],
  Dompu: [-8.5333, 118.4667],
  "Bima Kab": [-8.55, 118.5],

  // ── NUSA TENGGARA TIMUR ──
  Kupang: [-10.1718, 123.6075],
  Ende: [-8.85, 121.6667],
  Maumere: [-8.6167, 122.2167],
  Ruteng: [-8.6167, 120.4667],
  Labuan: [-8.5167, 119.8667],
  Bajawa: [-8.8, 121.1167],
  Waingapu: [-9.65, 120.2667],
  Waikabubak: [-9.65, 119.4167],
  Soe: [-9.8667, 124.3],
  Kefamenanu: [-9.45, 124.5],
  Atambua: [-9.1, 124.9],
  Larantuka: [-8.35, 123.0],
  "Flores Timur": [-8.45, 123.0],
  Sikka: [-8.6167, 122.2167],
  Nagekeo: [-8.8167, 121.3167],
  Ngada: [-8.8, 121.1167],
  Manggarai: [-8.6167, 120.4667],
  "Manggarai Barat": [-8.5167, 119.8667],
  "Manggarai Timur": [-8.65, 120.9],
  Sumba: [-9.65, 120.2667],
  "Sumba Barat": [-9.6667, 119.4],
  "Sumba Tengah": [-9.7, 119.8833],
  "Sumba Timur": [-9.65, 120.2667],
  "Sumba Barat Daya": [-9.9333, 119.3333],
  Alor: [-8.25, 124.5167],
  Lembata: [-8.35, 123.5],
  "Rote Ndao": [-10.7333, 123.1833],
  "Sabu Raijua": [-10.4833, 121.85],
  Malaka: [-9.5, 124.9167],
  "Timor Tengah Selatan": [-9.8667, 124.3],
  "Timor Tengah Utara": [-9.45, 124.5],
  Belu: [-9.1, 124.9],

  // ── KALIMANTAN BARAT ──
  Pontianak: [-0.0263, 109.3425],
  Singkawang: [0.9, 108.9872],
  Mempawah: [-0.35, 109.1667],
  Sambas: [1.3667, 109.3],
  Bengkayang: [0.8333, 109.8],
  Landak: [0.3667, 109.7167],
  Sanggau: [0.1167, 110.6167],
  Sekadau: [0.0333, 110.9667],
  Sintang: [0.0667, 111.5],
  Melawi: [-0.7, 111.4833],
  Kapuas: [-1.5833, 112.9333],
  Kayong: [-1.7333, 110.0833],
  Ketapang: [-1.8333, 109.9833],
  Kuburaya: [-0.2, 109.4333],

  // ── KALIMANTAN TENGAH ──
  Palangkaraya: [-2.2161, 113.9135],
  "Kapuas Tengah": [-3.0, 114.3833],
  "Barito Selatan": [-1.8333, 114.7667],
  "Barito Utara": [-0.9, 114.8333],
  "Barito Timur": [-1.7667, 115.3833],
  "Murung Raya": [-0.85, 114.9],
  Katingan: [-2.7, 112.95],
  Lamandau: [-1.9167, 111.6],
  Sukamara: [-2.7833, 111.1667],
  Seruyan: [-2.5, 112.6667],
  Gunung: [-2.2167, 111.8333],
  "Pulang Pisau": [-2.5667, 114.3],
  Kotawaringin: [-2.5, 111.9],
  "Kotawaringin Timur": [-2.2833, 113.3667],

  // ── KALIMANTAN SELATAN ──
  Banjarmasin: [-3.3194, 114.5908],
  Banjarbaru: [-3.4333, 114.8333],
  "Banjar Kalsel": [-3.5167, 114.7833],
  "Tanah Laut": [-3.7833, 114.7333],
  "Tanah Bumbu": [-3.5333, 115.7],
  Kotabaru: [-3.3333, 116.2333],
  Batola: [-3.0667, 114.8333],
  Tapin: [-3.1, 115.0],
  "Hulu Sungai Selatan": [-2.5667, 115.4],
  "Hulu Sungai Tengah": [-2.4167, 115.3667],
  "Hulu Sungai Utara": [-2.0667, 115.25],
  Tabalong: [-2.0, 115.6333],
  Balangan: [-2.3333, 115.4167],

  // ── KALIMANTAN TIMUR ──
  Samarinda: [-0.5022, 117.1536],
  Balikpapan: [-1.2675, 116.8289],
  Bontang: [0.1333, 117.5],
  Kutai: [-0.2333, 116.3167],
  "Kutai Barat": [-0.0667, 115.6667],
  "Kutai Timur": [1.2833, 116.85],
  Berau: [2.1333, 117.4833],
  Mahakam: [-0.5, 116.3],
  Penajam: [-1.3333, 116.3833],
  Paser: [-1.8333, 116.3167],

  // ── KALIMANTAN UTARA ──
  Tarakan: [3.3, 117.6333],
  Bulungan: [2.7667, 117.3667],
  Malinau: [3.5833, 116.6333],
  Nunukan: [4.1333, 117.6667],
  "Tana Tidung": [3.55, 117.3667],

  // ── SULAWESI UTARA ──
  Manado: [1.4931, 124.8413],
  Bitung: [1.4333, 125.1667],
  Tomohon: [1.3, 124.8167],
  Kotamobagu: [0.7333, 124.3167],
  Minahasa: [1.3167, 124.8],
  "Minahasa Utara": [1.6, 125.0],
  "Minahasa Selatan": [1.0167, 124.5],
  "Minahasa Tenggara": [0.9167, 124.7667],
  Bolmong: [0.6833, 124.1667],
  "Bolmong Utara": [0.7833, 123.95],
  "Bolmong Selatan": [0.3833, 124.1833],
  "Bolmong Timur": [0.5167, 124.4],
  Bolaang: [0.5, 124.0],
  "Kepulauan Sangihe": [3.5667, 125.5167],
  "Kepulauan Talaud": [4.35, 126.7833],
  "Siau Tagulandang Biaro": [2.7, 125.4],

  // ── SULAWESI TENGAH ──
  Palu: [-0.8917, 119.8707],
  Donggala: [-0.6833, 119.6],
  Sigi: [-1.1667, 119.8833],
  Parigi: [-0.7833, 120.3167],
  Tolitoli: [1.05, 120.8],
  Buol: [1.2, 121.45],
  Morowali: [-2.1667, 122.0],
  "Morowali Utara": [-1.65, 121.5],
  Touna: [-1.45, 122.0],
  Poso: [-1.5, 120.8],
  "Tojo Una-Una": [-0.8833, 121.5833],
  Banggai: [-1.4167, 123.2],
  "Banggai Kepulauan": [-1.5833, 123.6167],
  "Banggai Laut": [-1.65, 123.4833],

  // ── SULAWESI SELATAN ──
  Makassar: [-5.1477, 119.4328],
  Parepare: [-4.0167, 119.6333],
  Palopo: [-2.9917, 120.1978],
  Gowa: [-5.3, 119.65],
  Maros: [-5.0167, 119.5833],
  Pangkep: [-4.8167, 119.55],
  Barru: [-4.4167, 119.6167],
  Pinrang: [-3.7833, 119.6167],
  Luwu: [-2.7833, 120.6833],
  "Luwu Utara": [-2.3, 120.5],
  "Luwu Timur": [-2.5333, 121.45],
  "Tana Toraja": [-3.0333, 119.8833],
  "Toraja Utara": [-2.8667, 119.8],
  Wajo: [-3.8667, 120.2667],
  Bone: [-4.5333, 120.3667],
  Soppeng: [-4.3333, 119.9],
  Sidrap: [-3.8667, 119.9833],
  Enrekang: [-3.5667, 119.7833],
  Sinjai: [-5.1167, 120.2333],
  Bulukumba: [-5.5, 120.2167],
  Selayar: [-6.1167, 120.45],
  Bantaeng: [-5.5167, 119.9333],
  Jeneponto: [-5.6833, 119.6833],
  Takalar: [-5.4333, 119.4],
  "Kepulauan Selayar": [-6.1167, 120.45],

  // ── SULAWESI TENGGARA ──
  Kendari: [-3.9469, 122.5145],
  Baubau: [-5.4667, 122.6167],
  Kolaka: [-4.05, 121.5833],
  "Kolaka Utara": [-3.1667, 121.2667],
  "Kolaka Timur": [-4.3833, 122.1667],
  Konawe: [-3.75, 122.25],
  "Konawe Selatan": [-4.2667, 122.3833],
  "Konawe Utara": [-3.3333, 121.9],
  "Konawe Kepulauan": [-3.95, 123.3667],
  Muna: [-4.8833, 122.65],
  "Muna Barat": [-4.8333, 122.4],
  Buton: [-5.45, 122.55],
  "Buton Utara": [-4.8, 122.6667],
  "Buton Tengah": [-5.05, 122.5333],
  "Buton Selatan": [-5.5833, 122.8833],
  Bombana: [-5.0333, 121.9667],
  Wakatobi: [-5.4167, 123.6],

  // ── GORONTALO ──
  Gorontalo: [0.55, 123.0582],
  "Kota Gorontalo": [0.55, 123.0582],
  "Bone Bolango": [-0.3833, 122.5],
  Boalemo: [0.3833, 122.4],
  Pohuwato: [0.4167, 122.0],
  Gorut: [0.9667, 122.6167],

  // ── SULAWESI BARAT ──
  Mamuju: [-2.6833, 118.8833],
  Majene: [-3.5333, 118.9667],
  Polewali: [-3.4167, 119.3333],
  Mamasa: [-2.9333, 119.4],
  "Mamuju Utara": [-2.0167, 119.0833],
  "Mamuju Tengah": [-2.4833, 119.3833],
  Pasangkayu: [-1.4667, 119.3],

  // ── MALUKU ──
  Ambon: [-3.6954, 128.1814],
  Tual: [-5.65, 132.75],
  "Maluku Tengah": [-3.3833, 129.5],
  "Maluku Tenggara": [-5.65, 132.75],
  "Maluku Tenggara Barat": [-7.8833, 131.2],
  Seram: [-3.0667, 129.1667],
  Buru: [-3.2, 126.6333],
  "Buru Selatan": [-3.5, 127.1333],
  Aru: [-6.0, 134.3],
  "Kepulauan Tanimbar": [-7.8833, 131.2],

  // ── MALUKU UTARA ──
  Ternate: [0.7833, 127.3833],
  Tidore: [0.6667, 127.4167],
  "Halmahera Barat": [1.15, 127.5833],
  "Halmahera Tengah": [0.5, 128.1833],
  "Halmahera Timur": [0.75, 128.5167],
  "Halmahera Selatan": [-0.7833, 127.65],
  "Halmahera Utara": [1.9333, 127.75],
  Morotai: [2.3, 128.3333],
  "Pulau Taliabu": [-1.7833, 124.8167],
  "Kepulauan Sula": [-1.8167, 125.5333],

  // ── PAPUA BARAT ──
  Manokwari: [-0.8614, 134.0827],
  Sorong: [-0.8833, 131.25],
  Raja: [-0.2333, 130.5167],
  Fak: [-2.9167, 132.2667],
  Manokwariselatan: [-1.3167, 133.8167],
  Kaimana: [-3.6333, 133.75],
  "Teluk Bintuni": [-2.1, 133.5167],
  "Teluk Wondama": [-2.6167, 134.2833],
  Maybrat: [-1.2167, 132.35],
  "Sorong Selatan": [-1.7167, 131.35],
  Tambrauw: [-0.4833, 132.4],
  "Pegunungan Arfak": [-1.3167, 133.8],

  // ── PAPUA ──
  Jayapura: [-2.5489, 140.6734],
  Merauke: [-8.4667, 140.3833],
  Nabire: [-3.3667, 135.4833],
  Mimika: [-4.5, 136.9],
  Biak: [-1.1667, 136.1],
  Timika: [-4.5, 136.9],
  Wamena: [-4.0833, 138.95],
  Serui: [-1.8833, 136.2333],
  Paniai: [-3.8167, 136.3],
  Waropen: [-1.9667, 136.8167],
  Supiori: [-0.6833, 135.6667],
  "Kepulauan Yapen": [-1.8833, 136.2333],
  Boven: [-6.1167, 140.7167],
  Mappi: [-6.9333, 139.3667],
  Asmat: [-5.8833, 138.0667],
  "Pegunungan Bintang": [-5.1, 140.3667],
  Yahukimo: [-4.5, 139.2333],
  Tolikara: [-3.6333, 138.4667],
  Puncak: [-3.7167, 137.15],
  "Puncak Jaya": [-3.5, 137.0833],
  Lanny: [-3.9167, 138.35],
  "Mamberamo Raya": [-3.0, 138.4167],
  "Mamberamo Tengah": [-3.5, 138.0],
  Yalimo: [-4.1167, 139.1833],
  Nduga: [-4.5, 138.3333],
  Intan: [-3.9167, 136.2],
  Dogiyai: [-3.8667, 136.3],
  Deiyai: [-3.9, 136.3],
};

type ViewMode = "map" | "grid" | "list";

interface DistrictSummary {
  district: string;
  total: number;
  byAidType: Record<string, number>;
  byStatus: Record<string, number>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletLib = any;

function loadLeaflet(): Promise<LeafletLib> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as Record<string, unknown>).L) {
      resolve((window as unknown as Record<string, unknown>).L as LeafletLib);
      return;
    }
    // Load CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    // Load JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = (window as unknown as Record<string, unknown>).L as LeafletLib;
      // Fix default icon
      // biome-ignore lint/performance/noDelete: required for leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      resolve(L);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function InteractiveMap({
  districts,
  onSelect,
  selected,
}: {
  districts: DistrictSummary[];
  onSelect: (d: DistrictSummary | null) => void;
  selected: DistrictSummary | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    loadLeaflet()
      .then(() => setLeafletLoaded(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !containerRef.current || mapRef.current) return;
    const L = (window as unknown as Record<string, unknown>).L as LeafletLib;

    const map = L.map(containerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !leafletLoaded) return;
    const L = (window as unknown as Record<string, unknown>).L as LeafletLib;

    // Remove old markers
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    const maxTotal = Math.max(...districts.map((d) => d.total), 1);

    for (const d of districts) {
      const coords = DISTRICT_COORDS[d.district];
      if (!coords) continue;

      const radius = 8 + (d.total / maxTotal) * 24;
      const isSelected = selected?.district === d.district;

      const marker = L.circleMarker(coords, {
        radius,
        fillColor: isSelected ? "#f59e0b" : "#1e3a5f",
        color: isSelected ? "#d97706" : "#3b82f6",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9,
      });

      marker.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1e3a5f">${d.district}</div>
          <div style="font-size:13px;color:#444">Penerima Bantuan: <b>${formatNumber(d.total)}</b></div>
          <div style="margin-top:6px;font-size:12px;color:#666">
            ${d.byStatus.menunggu ? `<span style="color:#d97706">${d.byStatus.menunggu} menunggu</span> ` : ""}
            ${d.byStatus.diproses ? `<span style="color:#2563eb">${d.byStatus.diproses} diproses</span> ` : ""}
            ${d.byStatus.didistribusikan ? `<span style="color:#059669">${d.byStatus.didistribusikan} selesai</span>` : ""}
          </div>
        </div>`,
      );

      marker.on("click", () => onSelect(d));
      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [districts, selected, onSelect, leafletLoaded]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

export default function PetaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictSummary | null>(null);
  const { data: recipients, isLoading } = useGetAllAidRecipients();
  const { data: byDistrict } = useGetRecipientsByDistrict();

  const districtSummaries = useMemo<DistrictSummary[]>(() => {
    if (!recipients) return [];
    const distMap: Record<string, DistrictSummary> = {};
    for (const r of recipients) {
      if (!distMap[r.district]) {
        distMap[r.district] = {
          district: r.district,
          total: 0,
          byAidType: {},
          byStatus: {},
        };
      }
      const s = distMap[r.district];
      s.total++;
      s.byAidType[r.aidType] = (s.byAidType[r.aidType] ?? 0) + 1;
      s.byStatus[r.distributionStatus] =
        (s.byStatus[r.distributionStatus] ?? 0) + 1;
    }
    return Object.values(distMap).sort((a, b) => b.total - a.total);
  }, [recipients]);

  const filtered = useMemo(
    () =>
      districtSummaries.filter((d) =>
        d.district.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [districtSummaries, searchTerm],
  );

  const totalAll = byDistrict?.reduce((acc, [, n]) => acc + Number(n), 0) ?? 0;

  return (
    <div className="section-pattern min-h-screen">
      {/* Page Header */}
      <div className="bg-navy">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Sebaran Penerima Bantuan
              </h1>
              <p className="text-white/70">
                Data sebaran penerima bantuan bencana di seluruh kabupaten/kota
                se-Indonesia
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Total Penerima
              </span>
            </div>
            <p className="text-2xl font-display font-bold">
              {formatNumber(totalAll)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Kabupaten/Kota
              </span>
            </div>
            <p className="text-2xl font-display font-bold">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-card border border-border/50 col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Jenis Bantuan
              </span>
            </div>
            <p className="text-2xl font-display font-bold">5</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kabupaten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "map"
                  ? "bg-white shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Peta
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Map Container */}
            <div
              className="flex-1 bg-white rounded-xl shadow-card border border-border/50 overflow-hidden"
              style={{ height: 520 }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <InteractiveMap
                  districts={filtered}
                  onSelect={setSelectedDistrict}
                  selected={selectedDistrict}
                />
              )}
            </div>

            {/* Side panel */}
            <div className="lg:w-72 space-y-3">
              {selectedDistrict ? (
                <motion.div
                  key={selectedDistrict.district}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl shadow-card border border-border/50 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                      {selectedDistrict.district}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedDistrict(null)}
                      className="text-muted-foreground hover:text-foreground text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="bg-primary/10 rounded-lg px-4 py-3 text-center mb-4">
                    <p className="font-display font-bold text-3xl text-primary leading-none">
                      {formatNumber(selectedDistrict.total)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Penerima Bantuan
                    </p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Jenis Bantuan
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(selectedDistrict.byAidType).map(
                        ([type]) => (
                          <AidTypeBadge key={type} status={type} />
                        ),
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status Distribusi
                    </p>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                      {Object.entries(selectedDistrict.byStatus).map(
                        ([status, count]) => {
                          const pct = (count / selectedDistrict.total) * 100;
                          const colors: Record<string, string> = {
                            menunggu: "#d97706",
                            diproses: "#2563eb",
                            didistribusikan: "#059669",
                          };
                          return (
                            <div
                              key={status}
                              style={{
                                width: `${pct}%`,
                                backgroundColor: colors[status] ?? "#94a3b8",
                              }}
                              title={`${status}: ${count}`}
                            />
                          );
                        },
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      {selectedDistrict.byStatus.menunggu !== undefined && (
                        <span className="text-xs text-amber-600">
                          {selectedDistrict.byStatus.menunggu} menunggu
                        </span>
                      )}
                      {selectedDistrict.byStatus.diproses !== undefined && (
                        <span className="text-xs text-blue-600">
                          {selectedDistrict.byStatus.diproses} diproses
                        </span>
                      )}
                      {selectedDistrict.byStatus.didistribusikan !==
                        undefined && (
                        <span className="text-xs text-emerald-600">
                          {selectedDistrict.byStatus.didistribusikan} sudah
                          didistribusikan
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-xl shadow-card border border-border/50 p-5">
                  <p className="text-sm text-muted-foreground text-center">
                    Klik marker pada peta untuk melihat detail kabupaten
                  </p>
                </div>
              )}

              {/* Legend */}
              <div className="bg-white rounded-xl shadow-card border-2 border-blue-200 p-4">
                <p className="text-sm font-bold text-foreground mb-3">
                  KETERANGAN
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-md"
                      style={{
                        backgroundColor: "#1e3a5f",
                        border: "2.5px solid #3b82f6",
                      }}
                    />
                    <span className="text-sm text-foreground">
                      Lokasi penerima bantuan
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-md"
                      style={{
                        backgroundColor: "#f59e0b",
                        border: "2.5px solid #d97706",
                      }}
                    />
                    <span className="text-sm text-foreground">
                      Lokasi dipilih
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 mt-1 pt-2.5 border-t border-blue-100 font-medium">
                    Ukuran lingkaran menunjukkan jumlah penerima
                  </div>
                </div>
              </div>

              {/* Top districts */}
              <div className="bg-white rounded-xl shadow-card border border-border/50 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Top 5 Terbanyak
                </p>
                <div className="space-y-2">
                  {districtSummaries.slice(0, 5).map((d, i) => (
                    <button
                      key={d.district}
                      type="button"
                      onClick={() => setSelectedDistrict(d)}
                      className="w-full flex items-center gap-2 hover:bg-secondary/50 rounded-lg px-2 py-1.5 transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium flex-1 truncate">
                        {d.district}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {formatNumber(d.total)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {["a", "b", "c", "d", "e", "f"].map((k) => (
                  <Skeleton key={k} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((d, i) => (
                  <motion.div
                    key={d.district}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="bg-white rounded-xl shadow-card border border-border/50 hover:shadow-card-hover transition-shadow p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                            Kabupaten/Kota
                          </p>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                          {d.district}
                        </h3>
                      </div>
                      <div className="bg-primary/10 rounded-xl px-3 py-2 text-center">
                        <p className="font-display font-bold text-xl text-primary leading-none">
                          {formatNumber(d.total)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          penerima
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Jenis Bantuan
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(d.byAidType).map(([type]) => (
                          <AidTypeBadge key={type} status={type} />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
                        {Object.entries(d.byStatus).map(([status, count]) => {
                          const pct = (count / d.total) * 100;
                          const colors: Record<string, string> = {
                            menunggu: "#d97706",
                            diproses: "#2563eb",
                            didistribusikan: "#059669",
                          };
                          return (
                            <div
                              key={status}
                              style={{
                                width: `${pct}%`,
                                backgroundColor: colors[status] ?? "#94a3b8",
                              }}
                              title={`${status}: ${count}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex gap-3 mt-2">
                        {Object.entries(d.byStatus).map(([status, count]) => {
                          const colors: Record<string, string> = {
                            menunggu: "text-amber-600",
                            diproses: "text-blue-600",
                            didistribusikan: "text-emerald-600",
                          };
                          return (
                            <span
                              key={status}
                              className={`text-xs ${colors[status] ?? "text-gray-500"}`}
                            >
                              {count} {status}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div>
            {isLoading ? (
              <div className="space-y-2">
                {["a", "b", "c", "d", "e", "f"].map((k) => (
                  <Skeleton key={k} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-card border border-border/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left px-4 py-3 text-sm font-semibold">
                        Kabupaten/Kota
                      </th>
                      <th className="text-right px-4 py-3 text-sm font-semibold">
                        Total Penerima
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold hidden md:table-cell">
                        Jenis Bantuan
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold hidden lg:table-cell">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d, i) => (
                      <motion.tr
                        key={d.district}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-secondary/30 transition-colors border-t border-border/30"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="font-medium">{d.district}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-display font-semibold">
                          {formatNumber(d.total)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(d.byAidType).map(([type]) => (
                              <AidTypeBadge key={type} status={type} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex gap-2">
                            {d.byStatus.menunggu && (
                              <span className="text-xs text-amber-600">
                                {d.byStatus.menunggu} menunggu
                              </span>
                            )}
                            {d.byStatus.diproses && (
                              <span className="text-xs text-blue-600">
                                {d.byStatus.diproses} diproses
                              </span>
                            )}
                            {d.byStatus.didistribusikan && (
                              <span className="text-xs text-emerald-600">
                                {d.byStatus.didistribusikan} selesai
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada data ditemukan</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {filtered.length === 0 && !isLoading && viewMode !== "map" && (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">Tidak ada kabupaten ditemukan</p>
            <p className="text-sm">Coba kata kunci pencarian berbeda</p>
          </div>
        )}
      </div>
    </div>
  );
}
