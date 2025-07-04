import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  Users,
  Edit,
  BarChart2,
} from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Replace with your deployed Google Apps Script Web App URL
const scriptURL =
  "https://script.google.com/macros/s/AKfycbxaX9J7a1vB4BJrJLJv87hlJJtOzbOrfhjm9AKQ9QLafUcENGnD6IEysHwhXyLiTuR8Rg/exec";

interface QuizQuestion {
  id: string;
  soal: string;
  gambar: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawaban: string;
}

interface Student {
  id: string;
  nisn: string;
  nama_siswa: string;
}

interface ExamResult {
  nama: string;
  mata_pelajaran: string;
  bab_nama: string;
  nilai: number;
  persentase: number;
  timestamp: string;
  jenis_ujian: string;
  soal_1: string;
  soal_2: string;
  soal_3: string;
  soal_4: string;
  soal_5: string;
  soal_6: string;
  soal_7: string;
  soal_8: string;
  soal_9: string;
  soal_10: string;
  soal_11: string;
  soal_12: string;
  soal_13: string;
  soal_14: string;
  soal_15: string;
  soal_16: string;
  soal_17: string;
  soal_18: string;
  soal_19: string;
  soal_20: string;
}

const QuizMaker: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${scriptURL}?action=getQuestions`, {
      method: "GET",
      mode: "cors",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from getQuestions:", data);
        if (data.success && Array.isArray(data.data)) {
          const formattedQuestions = data.data.map((q: any) => ({
            id: q.id || "",
            soal: q.question || "",
            gambar: q.imageUrl || "",
            opsiA: q.options[0] || "",
            opsiB: q.options[1] || "",
            opsiC: q.options[2] || "",
            opsiD: q.options[3] || "",
            jawaban: q.answer || "A",
          }));
          console.log("Formatted questions:", formattedQuestions);
          setQuestions(formattedQuestions);
        } else {
          setSubmitStatus("❌ Gagal mengambil data soal dari Sheet2.");
          console.error("Error fetching questions:", data.message);
        }
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal mengambil data soal dari Sheet2.");
        console.error("Fetch error:", error);
      });
  }, []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: String(questions.length + 2),
        soal: "",
        gambar: "",
        opsiA: "",
        opsiB: "",
        opsiC: "",
        opsiD: "",
        jawaban: "A",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
  };

  const saveEditedQuestion = (index: number) => {
    const questionToSave = questions[index];
    if (!questionToSave) return;

    setIsSubmitting(true);
    setSubmitStatus("Mengirim perubahan...");

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "editQuestion",
        id: questionToSave.id,
        soal: questionToSave.soal,
        gambar: questionToSave.gambar,
        opsiA: questionToSave.opsiA,
        opsiB: questionToSave.opsiB,
        opsiC: questionToSave.opsiC,
        opsiD: questionToSave.opsiD,
        jawaban: questionToSave.jawaban,
      }),
    })
      .then(() => {
        setSubmitStatus("✅ Soal berhasil diperbarui!");
        setEditingIndex(null);
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal memperbarui soal.");
        console.error("Fetch error:", error);
        setIsSubmitting(false);
      });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    fetch(`${scriptURL}?action=getQuestions`, {
      method: "GET",
      mode: "cors",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const formattedQuestions = data.data.map((q: any) => ({
            id: q.id || "",
            soal: q.question || "",
            gambar: q.imageUrl || "",
            opsiA: q.options[0] || "",
            opsiB: q.options[1] || "",
            opsiC: q.options[2] || "",
            opsiD: q.options[3] || "",
            jawaban: q.answer || "A",
          }));
          setQuestions(formattedQuestions);
        }
      })
      .catch((error) => console.error("Error reloading questions:", error));
  };

  const handleSubmit = () => {
    const hasEmptyFields = questions.some(
      (q) =>
        !q.soal.trim() ||
        !String(q.opsiA).trim() ||
        !String(q.opsiB).trim() ||
        !String(q.opsiC).trim() ||
        !String(q.opsiD).trim() ||
        !q.jawaban.trim()
    );
    if (hasEmptyFields) {
      setSubmitStatus("⚠️ Semua field wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("Mengirim data...");

    const dataToSend = questions.map((q) => ({
      soal: q.soal,
      gambar: q.gambar,
      opsiA: q.opsiA,
      opsiB: q.opsiB,
      opsiC: q.opsiC,
      opsiD: q.opsiD,
      jawaban: q.jawaban,
    }));

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addToSheet2",
        data: dataToSend,
      }),
    })
      .then(() => {
        setSubmitStatus("✅ Data berhasil dikirim ke Sheet2!");
        setQuestions([...questions]);
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal mengirim data.");
        console.error("Fetch error:", error);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              Pembuat Soal Online
            </h1>
          </div>

          <p className="text-gray-600 mb-6">
            Buat soal pilihan ganda dan kirim langsung ke Sheet2 di Google
            Sheets Anda.
          </p>

          {submitStatus && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                submitStatus.includes("berhasil") ||
                submitStatus.includes("diperbarui")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : submitStatus.includes("Mengirim")
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {submitStatus}
            </div>
          )}

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Soal {index + 1}
                  </h3>
                  <div className="space-x-2">
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => startEditing(index)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pertanyaan
                    </label>
                    <textarea
                      value={question.soal}
                      onChange={(e) =>
                        updateQuestion(index, "soal", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Masukkan pertanyaan soal..."
                      disabled={editingIndex !== index}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gambar (URL - opsional)
                    </label>
                    <input
                      type="url"
                      value={question.gambar}
                      onChange={(e) =>
                        updateQuestion(index, "gambar", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/gambar.jpg"
                      disabled={editingIndex !== index}
                    />
                    {question.gambar && (
                      <div className="mt-2">
                        <img
                          src={question.gambar}
                          alt="Preview Gambar"
                          className="max-w-full h-auto mt-2 rounded-lg shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://via.placeholder.com/300?text=Gambar+tidak+ditemukan";
                            target.alt = "Gambar tidak valid";
                          }}
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi A
                      </label>
                      <input
                        type="text"
                        value={question.opsiA}
                        onChange={(e) =>
                          updateQuestion(index, "opsiA", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan A"
                        disabled={editingIndex !== index}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi B
                      </label>
                      <input
                        type="text"
                        value={question.opsiB}
                        onChange={(e) =>
                          updateQuestion(index, "opsiB", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan B"
                        disabled={editingIndex !== index}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi C
                      </label>
                      <input
                        type="text"
                        value={question.opsiC}
                        onChange={(e) =>
                          updateQuestion(index, "opsiC", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan C"
                        disabled={editingIndex !== index}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opsi D
                      </label>
                      <input
                        type="text"
                        value={question.opsiD}
                        onChange={(e) =>
                          updateQuestion(index, "opsiD", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Pilihan D"
                        disabled={editingIndex !== index}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jawaban Benar
                    </label>
                    <select
                      value={question.jawaban}
                      onChange={(e) =>
                        updateQuestion(index, "jawaban", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={editingIndex !== index}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  {editingIndex === index && (
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => saveEditedQuestion(index)}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <Save size={20} />
                        {isSubmitting ? "Menyimpan..." : "Simpan"}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Tambah Soal
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? "Mengirim..." : "Kirim ke Sheet2"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">
              Catatan Implementasi:
            </h4>
            <p className="text-sm text-yellow-700">
              Untuk mengirim data ke Google Sheets, pastikan:
            </p>
            <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
              <li>Google Apps Script sudah terhubung ke spreadsheet Anda.</li>
              <li>URL script sudah benar dan di-deploy sebagai web app.</li>
              <li>Script memiliki izin untuk menulis ke Sheet2.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentData: React.FC = () => {
  const [nisn, setNisn] = useState<string>("");
  const [namaSiswa, setNamaSiswa] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editNisn, setEditNisn] = useState<string>("");
  const [editNamaSiswa, setEditNamaSiswa] = useState<string>("");

  const fetchStudents = () => {
    fetch(`${scriptURL}?action=getFromDataSiswa`, {
      method: "GET",
      mode: "cors",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          setStudents(data.data);
        } else {
          setSubmitStatus("❌ Gagal mengambil data siswa dari DataSiswa.");
          console.error("Error fetching students:", data.message);
        }
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal mengambil data siswa dari DataSiswa.");
        console.error("Fetch error:", error);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = () => {
    if (!nisn.trim() || !namaSiswa.trim()) {
      setSubmitStatus("⚠️ Semua field wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("Mengirim data...");

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addToDataSiswa",
        data: [{ nisn, nama_siswa: namaSiswa }],
      }),
    })
      .then(() => {
        setSubmitStatus("✅ Siswa berhasil ditambahkan ke DataSiswa!");
        setNisn("");
        setNamaSiswa("");
        fetchStudents();
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal menambahkan siswa.");
        console.error("Fetch error:", error);
        setIsSubmitting(false);
      });
  };

  const deleteAllStudents = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua data siswa?")) return;

    setIsSubmitting(true);
    setSubmitStatus("Menghapus semua data siswa...");

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "deleteAllStudents",
      }),
    })
      .then(() => {
        setSubmitStatus("✅ Semua data siswa di DataSiswa berhasil dihapus!");
        setStudents([]);
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal menghapus data siswa.");
        console.error("Fetch error:", error);
        setIsSubmitting(false);
      });
  };

  const startEditingStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setEditNisn(student.nisn);
    setEditNamaSiswa(student.nama_siswa);
  };

  const saveEditedStudent = (id: string) => {
    if (!editNisn.trim() || !editNamaSiswa.trim()) {
      setSubmitStatus("⚠️ Semua field wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("Menyimpan perubahan...");

    fetch(scriptURL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "editStudent",
        id,
        nisn: editNisn,
        nama_siswa: editNamaSiswa,
      }),
    })
      .then(() => {
        setSubmitStatus("✅ Data siswa berhasil diperbarui!");
        setEditingStudentId(null);
        setEditNisn("");
        setEditNamaSiswa("");
        fetchStudents();
        setIsSubmitting(false);
      })
      .catch((error) => {
        setSubmitStatus("❌ Gagal memperbarui data siswa.");
        console.error("Fetch error:", error);
        setIsSubmitting(false);
      });
  };

  const cancelEditingStudent = () => {
    setEditingStudentId(null);
    setEditNisn("");
    setEditNamaSiswa("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Data Siswa</h1>
          </div>

          <p className="text-gray-600 mb-6">
            Tambah atau edit data siswa dan lihat daftar siswa yang sudah
            terinput di DataSiswa.
          </p>

          {submitStatus && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                submitStatus.includes("berhasil")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : submitStatus.includes("Mengirim") ||
                    submitStatus.includes("Menghapus") ||
                    submitStatus.includes("Menyimpan")
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {submitStatus}
            </div>
          )}

          <div className="grid gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NISN
              </label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan NISN"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Siswa
              </label>
              <input
                type="text"
                value={namaSiswa}
                onChange={(e) => setNamaSiswa(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama siswa"
              />
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {isSubmitting ? "Mengirim..." : "Tambah Siswa"}
              </button>
              <button
                onClick={deleteAllStudents}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Trash2 size={20} />
                {isSubmitting ? "Menghapus..." : "Hapus Semua Siswa"}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Daftar Siswa
            </h3>
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        NISN
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Nama Siswa
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-t">
                        {editingStudentId === student.id ? (
                          <>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              <input
                                type="text"
                                value={editNisn}
                                onChange={(e) => setEditNisn(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan NISN"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              <input
                                type="text"
                                value={editNamaSiswa}
                                onChange={(e) =>
                                  setEditNamaSiswa(e.target.value)
                                }
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Masukkan nama siswa"
                              />
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEditedStudent(student.id)}
                                  disabled={isSubmitting}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  <Save size={16} />
                                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                                </button>
                                <button
                                  onClick={cancelEditingStudent}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                  Batal
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {student.nisn}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {student.nama_siswa}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              <button
                                onClick={() => startEditingStudent(student)}
                                className="text-blue-500 hover:text-blue-700 transition-colors"
                              >
                                <Edit size={20} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">Belum ada data siswa.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamResults: React.FC = () => {
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchExamResults = () => {
    fetch(`${scriptURL}?action=getExamResults`, {
      method: "GET",
      mode: "cors",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from getExamResults:", data);
        if (data.success && Array.isArray(data.data)) {
          const formattedResults = data.data.map((result: any) => {
            console.log(`Result for ${result.nama || "Unknown"}:`, result);
            return {
              nama: result.nama || "",
              mata_pelajaran: result.mata_pelajaran || "",
              bab_nama: result.bab_nama || "",
              nilai: Number(result.nilai) || 0,
              persentase: Number(result.persentase) || 0,
              timestamp: result.timestamp || "",
              jenis_ujian: result.jenis_ujian || "",
              soal_1: String(result.soal_1 || ""),
              soal_2: String(result.soal_2 || ""),
              soal_3: String(result.soal_3 || ""),
              soal_4: String(result.soal_4 || ""),
              soal_5: String(result.soal_5 || ""),
              soal_6: String(result.soal_6 || ""),
              soal_7: String(result.soal_7 || ""),
              soal_8: String(result.soal_8 || ""),
              soal_9: String(result.soal_9 || ""),
              soal_10: String(result.soal_10 || ""),
              soal_11: String(result.soal_11 || ""),
              soal_12: String(result.soal_12 || ""),
              soal_13: String(result.soal_13 || ""),
              soal_14: String(result.soal_14 || ""),
              soal_15: String(result.soal_15 || ""),
              soal_16: String(result.soal_16 || ""),
              soal_17: String(result.soal_17 || ""),
              soal_18: String(result.soal_18 || ""),
              soal_19: String(result.soal_19 || ""),
              soal_20: String(result.soal_20 || ""),
            };
          });
          console.log("Formatted exam results:", formattedResults);
          // Only update state if data has changed
          if (
            JSON.stringify(formattedResults) !== JSON.stringify(examResults)
          ) {
            setExamResults(formattedResults);
          }
        } else {
          setError("❌ Gagal mengambil data hasil ujian dari HasilUjian.");
          console.error("Error fetching exam results:", data.message);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setError("❌ Gagal mengambil data hasil ujian dari HasilUjian.");
        console.error("Fetch error:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Initial fetch
    fetchExamResults();

    // Set up polling every 1 seconds
    const intervalId = setInterval(fetchExamResults, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Hasil Ujian</h2>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Nama</th>
                <th className="py-2 px-4 border">Mata Pelajaran</th>
                <th className="py-2 px-4 border">Bab</th>
                <th className="py-2 px-4 border">Nilai</th>
                <th className="py-2 px-4 border">Persentase</th>
                <th className="py-2 px-4 border">Tanggal</th>
                <th className="py-2 px-4 border">Jenis Ujian</th>
                <th className="py-2 px-4 border">Soal 1</th>
                <th className="py-2 px-4 border">Soal 2</th>
                <th className="py-2 px-4 border">Soal 3</th>
                <th className="py-2 px-4 border">Soal 4</th>
                <th className="py-2 px-4 border">Soal 5</th>
                <th className="py-2 px-4 border">Soal 6</th>
                <th className="py-2 px-4 border">Soal 7</th>
                <th className="py-2 px-4 border">Soal 8</th>
                <th className="py-2 px-4 border">Soal 9</th>
                <th className="py-2 px-4 border">Soal 10</th>
                <th className="py-2 px-4 border">Soal 11</th>
                <th className="py-2 px-4 border">Soal 12</th>
                <th className="py-2 px-4 border">Soal 13</th>
                <th className="py-2 px-4 border">Soal 14</th>
                <th className="py-2 px-4 border">Soal 15</th>
                <th className="py-2 px-4 border">Soal 16</th>
                <th className="py-2 px-4 border">Soal 17</th>
                <th className="py-2 px-4 border">Soal 18</th>
                <th className="py-2 px-4 border">Soal 19</th>
                <th className="py-2 px-4 border">Soal 20</th>
              </tr>
            </thead>
            <tbody>
              {examResults.length === 0 ? (
                <tr>
                  <td colSpan={27} className="py-2 px-4 border text-center">
                    Tidak ada data hasil ujian.
                  </td>
                </tr>
              ) : (
                examResults.map((result, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border">{result.nama}</td>
                    <td className="py-2 px-4 border">
                      {result.mata_pelajaran}
                    </td>
                    <td className="py-2 px-4 border">{result.bab_nama}</td>
                    <td className="py-2 px-4 border">{result.nilai}</td>
                    <td className="py-2 px-4 border">{result.persentase}%</td>
                    <td className="py-2 px-4 border">{result.timestamp}</td>
                    <td className="py-2 px-4 border">{result.jenis_ujian}</td>
                    <td className="py-2 px-4 border">{result.soal_1}</td>
                    <td className="py-2 px-4 border">{result.soal_2}</td>
                    <td className="py-2 px-4 border">{result.soal_3}</td>
                    <td className="py-2 px-4 border">{result.soal_4}</td>
                    <td className="py-2 px-4 border">{result.soal_5}</td>
                    <td className="py-2 px-4 border">{result.soal_6}</td>
                    <td className="py-2 px-4 border">{result.soal_7}</td>
                    <td className="py-2 px-4 border">{result.soal_8}</td>
                    <td className="py-2 px-4 border">{result.soal_9}</td>
                    <td className="py-2 px-4 border">{result.soal_10}</td>
                    <td className="py-2 px-4 border">{result.soal_11}</td>
                    <td className="py-2 px-4 border">{result.soal_12}</td>
                    <td className="py-2 px-4 border">{result.soal_13}</td>
                    <td className="py-2 px-4 border">{result.soal_14}</td>
                    <td className="py-2 px-4 border">{result.soal_15}</td>
                    <td className="py-2 px-4 border">{result.soal_16}</td>
                    <td className="py-2 px-4 border">{result.soal_17}</td>
                    <td className="py-2 px-4 border">{result.soal_18}</td>
                    <td className="py-2 px-4 border">{result.soal_19}</td>
                    <td className="py-2 px-4 border">{result.soal_20}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex gap-4">
          <Link to="/" className="flex items-center gap-2 hover:underline">
            <FileText size={20} />
            Pembuat Soal
          </Link>
          <Link
            to="/students"
            className="flex items-center gap-2 hover:underline"
          >
            <Users size={20} />
            Data Siswa
          </Link>
          <Link
            to="/exam-results"
            className="flex items-center gap-2 hover:underline"
          >
            <BarChart2 size={20} />
            Hasil Ujian
          </Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<QuizMaker />} />
        <Route path="/students" element={<StudentData />} />
        <Route path="/exam-results" element={<ExamResults />} />
      </Routes>
    </Router>
  );
};

export default App;
