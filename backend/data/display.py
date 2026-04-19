PERFORMANCE_LABELS = {
    "À risque": "At Risk",
    "Moyenne performance": "Average Performance",
    "Bon performeur": "High Performer",
    "Non Analysé": "Not Analyzed",
    "Non évalué": "Not Evaluated",
    "Inconnu": "Unknown",
}

SUBJECT_LABELS = {
    "Mathématiques": "Mathematics",
    "Moyenne Générale": "Overall Average",
    "Moyenne Générale (Est.)": "Estimated Overall Average",
}


def display_performance_label(value):
    return PERFORMANCE_LABELS.get(value, value)


def display_subject_name(value):
    if not value:
        return value

    translated = value
    for source, target in SUBJECT_LABELS.items():
        translated = translated.replace(source, target)
    return translated