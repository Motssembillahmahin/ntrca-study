TOPICS: dict[str, list[str]] = {
    "ICT": [
        "Number Systems",
        "Logic Gates & Boolean Algebra",
        "Networking & OSI Model",
        "Database & SQL",
        "OOP Concepts",
        "Web (HTML & CSS)",
        "Computer Organization",
        "Programming Basics",
        "ICT Act & Digital Bangladesh",
    ],
    "Bangla": [
        "Grammar: সন্ধি ও সমাস",
        "Grammar: কারক ও বিভক্তি",
        "Literature Basics",
        "Proverbs & Idioms",
    ],
    "English": [
        "Tenses",
        "Voice Change",
        "Narration",
        "Parts of Speech",
        "Vocabulary & Synonyms",
    ],
    "Math": [
        "Percentage & Ratio",
        "Profit & Loss",
        "Algebra",
        "Geometry",
    ],
    "GK": [
        "Bangladesh Constitution",
        "Liberation War 1971",
        "Current Affairs",
        "International Affairs",
    ],
}


def get_all_topics() -> dict[str, list[str]]:
    return TOPICS


def is_valid_subtopic(subject: str, subtopic: str) -> bool:
    return subtopic in TOPICS.get(subject, [])
