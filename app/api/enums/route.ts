export async function GET() {
  return Response.json({
    status: true,
    data: {
      moduleTypes: [
        { type: "LESSON",     label: "Lesson"     },
        { type: "REVISION",   label: "Revision"   },
        { type: "QUIZ",       label: "Quiz"       },
        { type: "FINAL_QUIZ", label: "Final Quiz" },
      ],
      contentTypes: [
        { type: "VIDEO",    label: "Video"    },
        { type: "PDF",      label: "PDF"      },
        { type: "DOCUMENT", label: "Document" },
      ],
      revisionContentTypes: [
        { type: "VIDEO", label: "Video" },
        { type: "PDF",   label: "PDF"   },
      ],
      courseStatuses: [
        { type: "Draft",     label: "Draft"     },
        { type: "Published", label: "Published" },
        { type: "Archived",  label: "Archived"  },
      ],
      
      // ===== UPDATED TO MATCH DATABASE ENUMS =====
      difficulties: [
        { type: "Easy",       label: "Easy"       },
        { type: "Medium",     label: "Medium"     },
        { type: "Difficult",  label: "Difficult"  },
        { type: "Challenging", label: "Challenging" },
      ],
      
      questionTypes: [
        { type: "Conceptual",     label: "Conceptual"     },
        { type: "Prediction",     label: "Prediction"     },
        { type: "Debugging",      label: "Debugging"      },
        { type: "ProblemSolving", label: "Problem Solving" },
      ],
      
      bloomLevels: [
        { type: "Remember",   label: "Remember"   },
        { type: "Understand", label: "Understand" },
        { type: "Apply",      label: "Apply"      },
        { type: "Analyze",    label: "Analyze"    },
        { type: "Evaluate",   label: "Evaluate"   },
        { type: "Create",     label: "Create"     },
      ],
    },
  });
}