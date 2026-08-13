import Link from "next/link";
import Image from "next/image";
import { Book } from "../types";
import { Book as BookIcon } from "lucide-react";

interface BookCardProps {
    book: Book;
}

export default function BookCard({ book }: BookCardProps) {
    const isAvailable = book.status === "AVAILABLE";

    return (
        <Link href={`/books/${book.id}`} className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Book Cover */}
            <div className="relative aspect-[3/4] bg-gray-100 flex flex-col items-center justify-center p-6 text-center border-b border-gray-100 group-hover:bg-gray-50 transition-colors">
                {book.imageUrl ? (
                    <Image
                        src={book.imageUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <>
                        <BookIcon className="h-12 w-12 text-gray-300 mb-3" strokeWidth={1.5} />
                        <h3 className="font-serif text-lg font-medium text-gray-700 line-clamp-3 z-10">
                            {book.title}
                        </h3>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2 flex justify-between items-start gap-2">
                    <div className="flex flex-col min-w-0 flex-1">
                        <h4 className="text-base font-semibold text-gray-900 truncate" title={book.title}>
                            {book.title}
                        </h4>
                        <p className="text-xs text-gray-500 truncate" title={book.author}>
                            by {book.author}
                        </p>
                    </div>
                    {isAvailable ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            Available
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Borrowed
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                            {book.owner?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                        <span className="truncate max-w-[100px]">{book.owner?.name}</span>
                    </div>
                    {book.category?.name && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                            {book.category.name}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
