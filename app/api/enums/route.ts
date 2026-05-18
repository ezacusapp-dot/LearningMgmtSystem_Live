

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
      // ===== NEW ENUMS FOR QUIZ BUILDER =====
      difficulties: [
        { type: "Easy",   label: "Easy"   },
        { type: "Medium", label: "Medium" },
        { type: "Hard",   label: "Hard"   },
      ],
      bloomLevels: [
        { type: "Remember",   label: "Remember"   },
        { type: "Understand", label: "Understand" },
        { type: "Apply",      label: "Apply"      },
        { type: "Analyze",    label: "Analyze"    },
        { type: "Evaluate",   label: "Evaluate"   },
        { type: "Create",     label: "Create"     },
      ],
      questionTypes: [
        { type: "Conceptual",        label: "Conceptual"        },
        { type: "OutputPrediction",  label: "Output Prediction" },
        { type: "ProblemSolving",    label: "Problem Solving"   },
        { type: "Debugging",         label: "Debugging"         },
      ],
    },
  });
}