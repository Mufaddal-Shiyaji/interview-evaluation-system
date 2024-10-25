import Test from "../models/Test.js";
import User from "../models/User.js";
import Interview from "../models/Interview.js";

const getAllTestsForInterviewer = async (req, res) => {
  try {
    const interviewerUsername = req.params.interviewerUsername;
    const tests = await Test.find({ createdByUsername: interviewerUsername });
    if (!tests) return res.status(404).json({ message: "No tests found" });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const createTest = async (req, res) => {
  const {
    subject,
    difficultyLevel,
    subTopic,
    time,
    specificRequirements,
    studentUsernames,
  } = req.body;

  try {
    // Find and verify that all specified student usernames exist and have the "interviewee" role
    const students = await User.find({
      username: { $in: studentUsernames },
      role: "interviewee",
    });

    if (students.length !== studentUsernames.length) {
      // Handle the case where some usernames were not found
      const foundUsernames = students.map((student) => student.username);
      const missingUsernames = studentUsernames.filter(
        (username) => !foundUsernames.includes(username)
      );

      return res.status(400).json({
        message: "Some student usernames were not found in the database",
        missingUsernames,
      });
    }

    // Create the new test if all students are valid
    const newTest = new Test({
      subject,
      difficultyLevel,
      subTopic,
      time,
      specificRequirements,
      studentUsernames,
      createdByUsername: req.params.interviewerUsername,
    });

    await newTest.save();

    // Add the test ID to the interviewer's tests array
    await User.updateOne(
      { username: req.params.interviewerUsername },
      { $push: { tests: newTest._id } }
    );

    // Add the test ID to each interviewee's tests array
    await User.updateMany(
      { username: { $in: studentUsernames } },
      { $push: { tests: newTest._id } }
    );

    res.status(201).json({
      message: "Test created successfully and added to users",
      test: newTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ message: "Error creating test", error });
  }
};

const cancelTest = async (req, res) => {
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    await User.updateOne(
      { username: test.createdByUsername },
      { $pull: { tests: test._id } }
    );
    await User.updateMany(
      { username: { $in: test.studentUsernames } },
      { $pull: { tests: test._id } }
    );

    await Interview.deleteMany({ testId: test._id });
    console.log("works");
    await Test.findByIdAndDelete(testId);

    res.json({ message: "Test cancelled and deleted successfully" });
  } catch (error) {
    console.error("Error cancelling test:", error);
    res.status(500).json({ message: "Error cancelling test" });
  }
};

const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;

    // Fetch the test and validate
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Retrieve students for the test
    const students = await User.find({
      username: { $in: test.studentUsernames },
    });

    // Prepare result data for each student
    const results = await Promise.all(
      students.map(async (student) => {
        const interview = await Interview.findOne({
          testId,
          intervieweeId: student._id,
        });

        // Check if interview is completed
        return {
          username: student.username,
          completed: interview ? interview.completed : false,
          resultPDF:
            interview && interview.completed ? interview.resultPDF : null,
        };
      })
    );

    res.status(200).json({ test, results });
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ message: "Error fetching test results" });
  }
};

export { getTestResults, cancelTest, createTest, getAllTestsForInterviewer };
